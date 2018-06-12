const xml2js = require('xml2js')
const customer = require('./customer')

// findGCP expects an SSCC-18 input and will return the matching customer GCP
// as configured in the customer JSON file
function findGCP (input) {
    for (prop in customer)
        if (input.slice(1, prop.length + 1) === prop)
            return prop  
}

// validate expects a 20 digit GS1 SSCC-18
exports.validate = input => {
    if (input.substr(0,2) != '00')
        return false
    if (input.length != 20)
        return false
    // Add more validation here    
    return true
}

exports.plainToURI = input => {
    var ext, gcp, serial    
    // Ext digit
    ext = input.slice(0,1)    
    // Find a matching GCP
    gcp = findGCP(input)   
    // Serial Number
    var serial = input.slice(gcp.length + 1)    
    return gcp + '.' + ext + serial
}

exports.updateEPCIS = (data, sscc, gcp) =>
{
    var builder = new xml2js.Builder()
    data['epcis:EPCISDocument']['EPCISBody'][0]['EventList'][0]['ObjectEvent'][0]['epcList'][0]['epc'][0] = 'urn:epc:id:sscc:' + sscc
    data['epcis:EPCISDocument']['EPCISBody'][0]['EventList'][0]['ObjectEvent'][0]['eventTime'][0] = new Date().toISOString()    
    data['epcis:EPCISDocument']['EPCISBody'][0]['EventList'][0]['ObjectEvent'][0]['e:shipToLocationId'][0]['_'] = customer[gcp]
    return builder.buildObject(data)   
}

exports.findGCP = findGCP

exports.parseString = xml2js.parseString