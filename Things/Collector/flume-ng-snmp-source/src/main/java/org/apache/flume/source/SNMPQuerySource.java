/***************************************************************
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
 ****************************************************************/
package org.apache.flume.source;

import java.io.IOException;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.TimeZone;
import java.util.Vector;

import org.apache.flume.ChannelException;
import org.apache.flume.Context;
import org.apache.flume.CounterGroup;
import org.apache.flume.Event;
import org.apache.flume.EventDeliveryException;
import org.apache.flume.PollableSource;
import org.apache.flume.conf.Configurable;
import org.apache.flume.event.SimpleEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.snmp4j.CommunityTarget;
import org.snmp4j.PDU;
import org.snmp4j.Snmp;
import org.snmp4j.event.ResponseEvent;
import org.snmp4j.mp.SnmpConstants;
import org.snmp4j.smi.OID;
import org.snmp4j.smi.OctetString;
import org.snmp4j.smi.UdpAddress;
import org.snmp4j.smi.VariableBinding;
import org.snmp4j.transport.DefaultUdpTransportMapping;

import com.google.common.collect.ImmutableMap;

public class SNMPQuerySource extends AbstractSource implements Configurable,
		PollableSource {

	private String bindAddress;
	private int bindPort;
	private int delayQuery;
	private VariableBinding[] odisArray;
	private PDU pdu;
	private CommunityTarget target;
	private Snmp snmp;
	private CounterGroup counterGroup;
	private static final int DEFAULT_PORT = 161;
	private static final int DEFAULT_DELAY = 30; // seconds

	private static final Logger logger = LoggerFactory
			.getLogger(SNMPTrapSource.class);

	@Override
	public void start() {
		// Initialize the connection to the external client
		try {
			snmp = new Snmp(new DefaultUdpTransportMapping());
			snmp.listen();

			target = new CommunityTarget();
			target.setCommunity(new OctetString("public"));
			target.setVersion(SnmpConstants.version2c);
			target.setAddress(new UdpAddress(bindAddress + "/" + bindPort));
			target.setTimeout(3000); // 3s
			target.setRetries(1);

			pdu.setType(PDU.GET);
			//pdu.setType(PDU.GETNEXT);
			
			/*pdu.setType(PDU.GETBULK);
			pdu.setMaxRepetitions(1);
			pdu.setNonRepeaters(0);*/

		} catch (IOException ex) {
			//
		}

		super.start();
	}

	@Override
	public void stop() {
		logger.info("SNMPQuery Source stopping...");
		logger.info("Metrics:{}", counterGroup);

		super.stop();
	}

	@Override
	public Status process() throws EventDeliveryException {
		Status status = null;
		counterGroup = new CounterGroup();

		try {
			// This try clause includes whatever Channel operations you want to
			// do
			Event event = new SimpleEvent();
			Map<String, String> headers = new HashMap<String, String>();
			StringBuilder stringBuilder = new StringBuilder();

			ResponseEvent responseEvent = snmp.get(pdu, target);
			//ResponseEvent responseEvent = snmp.getNext(pdu, target);
			/*ResponseEvent responseEvent = snmp.send(pdu, target);*/
			PDU response = responseEvent.getResponse();

			// 구분자 콤마

			// Timestamp
			/*Date time = new Date();
			String dateFormat = "[yyyy-MM-dd]HH:mm:ss";
			SimpleDateFormat df = new SimpleDateFormat(dateFormat, Locale.KOREA);
			String currentTime = df.format(time);			
			stringBuilder.append(currentTime + ",");
*/
			TimeZone tz = TimeZone.getTimeZone("Asia/Seoul");
			
			Date date = new Date();
			String dateFormat = "[yyyy-MM-dd]HH:mm:ss";
			SimpleDateFormat df = new SimpleDateFormat(dateFormat, Locale.KOREA);
					
			df.setTimeZone(tz);
			stringBuilder.append(df.format(date) + ",");
			//System.out.println(df.format(date));
			
			// IP주소
			/*String hostname = null;
			hostname = InetAddress.getLocalHost().getHostName();
			stringBuilder.append(hostname + ",");*/
			
			String ip = null;
			Enumeration<NetworkInterface> en;	
							
			
			// Find all network interfaces
			en = NetworkInterface.getNetworkInterfaces();
			
			// Find all elements in each interfaces
			while(en.hasMoreElements()) {
				NetworkInterface ni = en.nextElement();
				// Except docker interface and loop back interface
				if(ni.toString().contains("docker") || ni.toString().contains("vm") ||ni.isLoopback()){
					
					continue;			
				}else{
					
				}
				
				// Find a right IP address
				Enumeration<InetAddress> inetAddresses = ni.getInetAddresses();
				while(inetAddresses.hasMoreElements()) { 
					InetAddress ia = inetAddresses.nextElement();
					// Except null values and interface names			
					if (ia.getHostAddress() != null && ia.getHostAddress().indexOf(".") != -1) {					
						ip = ia.getHostAddress();
					
							//System.out.println("ㄴ"+ip+": It is a right ip address");
						stringBuilder.append(ip+ ",");
						break;
					}else{
														
					}
				}			
			}
			
			
			// 데이터
			if (response == null) {
				logger.info("TimeOut...");
			} else {
				if (response.getErrorStatus() == PDU.noError) {
					Vector<? extends VariableBinding> vbs = response
							.getVariableBindings();
					for (VariableBinding vb : vbs) {
						/*
						 * logger.info(vb.getVariable().toString()); //
						 * System.out.println(vb.getVariable().toString());
						 * Variable vv = vb.getVariable();
						 * logger.info("Value :", vv.toString());
						 * stringBuilder.append(vv.toString() + ",");
						 */

						stringBuilder.append(vb.getVariable().toString() + ",");
					}
				} else {
					logger.info("Error:" + response.getErrorStatusText());
				}
			}

			String messageString = stringBuilder.toString();
			// trick: remove the last comma
			messageString = messageString.replaceAll(",$", "");
			byte[] message = messageString.getBytes();

			headers.put("timestamp", String.valueOf(System.currentTimeMillis()));
			logger.info("Message: {}", messageString);
			event.setBody(message);
			event.setHeaders(headers);

			// Store the Event into this Source's associated Channel(s)
			getChannelProcessor().processEvent(event);
			counterGroup.incrementAndGet("events.success");

			Thread.sleep(delayQuery * 1000);
			status = Status.READY;

		} catch (ChannelException | IOException | InterruptedException ex) {
			counterGroup.incrementAndGet("events.dropped");
			logger.error("Error writting to channel", ex);
			// Log exception, handle individual exceptions as needed
			status = Status.BACKOFF;

			// re-throw all Errors
			// if (t instanceof Error) {
			// throw (Error);
			// }
		}
		return status;
	}

	@Override
	public void configure(Context context) {
		ImmutableMap<String, String> parameters;
		String baseString = "oid";
		boolean notFound = true;		
		int i = 0;

		parameters = context.getParameters();
		logger.info("v1");
		logger.info("parameters: " + parameters);

		pdu = new PDU();

		do {
			i++;
			if (!parameters.containsKey(baseString + i)) {
				notFound = false;
			} else {
				logger.info("parameter: " + parameters.get(baseString + i));
				pdu.add(new VariableBinding(new OID(parameters.get(baseString
						+ i))));
			}
		} while (notFound);

		bindAddress = context.getString("host");
		bindPort = context.getInteger("port", DEFAULT_PORT);
		delayQuery = context.getInteger("delay", DEFAULT_DELAY);
	}
}
