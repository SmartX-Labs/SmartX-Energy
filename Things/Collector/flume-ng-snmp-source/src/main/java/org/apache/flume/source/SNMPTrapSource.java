/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

package org.apache.flume.source;

import java.io.IOException;
import java.util.Vector;
import java.util.Map;
import java.util.HashMap;
import org.apache.flume.ChannelException;
import org.apache.flume.Context;
import org.apache.flume.CounterGroup;
import org.apache.flume.Event;
import org.apache.flume.event.SimpleEvent;
import org.apache.flume.EventDrivenSource;
import org.apache.flume.conf.Configurable;
import org.snmp4j.CommandResponder;
import org.snmp4j.CommandResponderEvent;
import org.snmp4j.CommunityTarget;
import org.snmp4j.MessageDispatcher;
import org.snmp4j.MessageDispatcherImpl;
import org.snmp4j.MessageException;
import org.snmp4j.PDU;
import org.snmp4j.Snmp;
import org.snmp4j.log.LogFactory;
import org.snmp4j.mp.MPv1;
import org.snmp4j.mp.MPv2c;
import org.snmp4j.mp.StateReference;
import org.snmp4j.mp.StatusInformation;
import org.snmp4j.security.Priv3DES;
import org.snmp4j.security.SecurityProtocols;
import org.snmp4j.smi.OctetString;
import org.snmp4j.smi.TcpAddress;
import org.snmp4j.smi.TransportIpAddress;
import org.snmp4j.smi.UdpAddress;
import org.snmp4j.smi.VariableBinding;
import org.snmp4j.tools.console.SnmpRequest;
import org.snmp4j.transport.AbstractTransportMapping;
import org.snmp4j.transport.DefaultTcpTransportMapping;
import org.snmp4j.transport.DefaultUdpTransportMapping;
import org.snmp4j.util.MultiThreadedMessageDispatcher;
import org.snmp4j.util.ThreadPool;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/*
 *  The pollable source will get regularly polled by the source runner asking it 
 *  to generate events. Nevertheless this is a event driven source which is 
 *  responsible for generating the events itself and normally does this 
 *  in response to some event happening, in this case the SNMP Trap.
 */
public class SNMPTrapSource extends AbstractSource
    implements EventDrivenSource, Configurable {

    private String bindAddress;
    private int bindPort;
    private static final int DEFAULT_PORT = 5140;
    private static final String DEFAULT_BIND = "127.0.0.1";

    private static final Logger logger = LoggerFactory
        .getLogger(SNMPTrapSource.class);

    private CounterGroup counterGroup = new CounterGroup();

    public class SNMPTrapHandler implements CommandResponder
    {
        private CounterGroup counterGroup = new CounterGroup();

        /**
         * This method will listen for traps and response pdu's from SNMP agent.
         */
        public synchronized void listen(TransportIpAddress address) throws IOException
        {
            AbstractTransportMapping transport;

            if (address instanceof TcpAddress) {
                transport = new DefaultTcpTransportMapping((TcpAddress) address);
            } else {
                transport = new DefaultUdpTransportMapping((UdpAddress) address);
            }

            ThreadPool threadPool = ThreadPool.create("DispatcherPool", 10);
            MessageDispatcher mtDispatcher = new MultiThreadedMessageDispatcher(threadPool, 
                    new MessageDispatcherImpl());

            // add message processing models
            mtDispatcher.addMessageProcessingModel(new MPv1());
            mtDispatcher.addMessageProcessingModel(new MPv2c());

            // add all security protocols
            SecurityProtocols.getInstance().addDefaultProtocols();
            SecurityProtocols.getInstance().addPrivacyProtocol(new Priv3DES());

            //Create Target
            CommunityTarget target = new CommunityTarget();
            target.setCommunity(new OctetString("public"));

            Snmp snmp = new Snmp(mtDispatcher, transport);
            snmp.addCommandResponder(this);

            transport.listen();
            logger.info("Listening on " + address);

            try {
                this.wait();
            }
            catch (InterruptedException ex) {
                Thread.currentThread().interrupt();
            }
        }

        /**
         * This method will be called whenever a pdu is received on the 
         * given port specified in the listen() method.
         */
        @Override
		public synchronized void processPdu(CommandResponderEvent cmdRespEvent)
        {
            logger.info("Received PDU...");
            PDU pdu = cmdRespEvent.getPDU();

            if (pdu != null) {
                try {
                    Event event;
                    Map <String, String> headers;
                    StringBuilder stringBuilder = new StringBuilder();

		            // getVariableBindings: Gets the variable binding vector.
                    Vector<? extends VariableBinding> vbs = pdu.getVariableBindings();
                    for (VariableBinding vb : vbs) {
			            // To extract only the value of the OID
                        //stringBuilder.append(vb.getVariable().toString());
                        stringBuilder.append(vb.toString() + ",");
                    }

                    String messageString = stringBuilder.toString();

                    // trick: remove the last comma
                    messageString = messageString.replaceAll(",$", "");

                    byte[] message = messageString.getBytes();

                    event = new SimpleEvent();
                    headers = new HashMap<String, String>();

                    headers.put("timestamp", String.valueOf(System.currentTimeMillis()));
                    logger.info("Message: {}", messageString);
                    event.setBody(message);
                    event.setHeaders(headers);

                    if (event == null) {
                        return;
                    }

                    // store the event to underlying channels(s)
                    getChannelProcessor().processEvent(event);

                    counterGroup.incrementAndGet("events.success");

                } catch (ChannelException ex) {
                    counterGroup.incrementAndGet("events.dropped");
                    logger.error("Error writting to channel", ex);
                    return;
                }

                logger.info("Trap Type = " + pdu.getType());
                logger.info("Variable Bindings = " + pdu.getVariableBindings());

                int pduType = pdu.getType();

                if ((pduType != PDU.TRAP) && (pduType != PDU.V1TRAP) 
                        && (pduType != PDU.REPORT) && (pduType != PDU.RESPONSE)) {
                    pdu.setErrorIndex(0);
                    pdu.setErrorStatus(0);
                    pdu.setType(PDU.RESPONSE);
                    StatusInformation statusInformation = new StatusInformation();
                    StateReference ref = cmdRespEvent.getStateReference();

                    try {
                        System.out.println(cmdRespEvent.getPDU());
                        cmdRespEvent.getMessageDispatcher()
				            .returnResponsePdu(cmdRespEvent.getMessageProcessingModel(),
                                	cmdRespEvent.getSecurityModel(), 
                                	cmdRespEvent.getSecurityName(), 
                                	cmdRespEvent.getSecurityLevel(),
                                	pdu, cmdRespEvent.getMaxSizeResponsePDU(), 
                                    ref, statusInformation);
                    }
                    catch (MessageException ex) {
                        System.err.println("Error while sending response: " + ex.getMessage());
                        LogFactory.getLogger(SnmpRequest.class).error(ex);
                    }
                 }
            }
        }
    }

    @Override
    public void start() {
        SNMPTrapHandler snmp4jTrapReceiver = new SNMPTrapHandler();
        try {
            snmp4jTrapReceiver.listen(new UdpAddress(bindAddress + "/" + bindPort));
        }
        catch (IOException e) {
            logger.info("Error in Listening for Trap");
            logger.info("Exception Message = ", e.getMessage());
        }

        super.start();
    }

    @Override
    public void stop() {
        logger.info("SNMPTrap Source stopping...");
        logger.info("Metrics:{}", counterGroup);

        super.stop();
    }

    @Override
    public void configure(Context context) {
        /*
         * Default is to listen on UDP port 162 on all IPv4 interfaces. 
         * Since 162 is a privileged port, snmptrapd must typically be run as root. 
         * Or change to non-privileged port > 1024.
         */
        bindAddress = context.getString("bind", DEFAULT_BIND);
        bindPort = context.getInteger("port", DEFAULT_PORT);
    }

}

