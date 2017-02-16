var coap        = require('coap')



// the default CoAP port is 5683
  var req = coap.request('coap://localhost/test123')

  req.on('response', function(res) {
    res.pipe(process.stdout)
    res.on('end', function() {
      process.exit(0)
    })
  })

  req.end()
