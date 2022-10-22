import GreenTrace from "@tgwf/greentrace-cli"
import polka from "polka"
// const domainName = "developers.thegreenwebfoundation.org"

const greentrace = async (domain) => {
try {
    // return a Promise, that resolves to an array
    const hops = await GreenTrace.trace(domain)
    // console.log({hops})
    // console.log("hops", JSON.stringify (hops, null, 2)) 

    const ips = []
    // loop through the objects in the array, get the key and all the values
    for (const hop of hops) {
        const ip = Object.keys(hop)[0]
        const values = Object.values(hop)[0]
        ips.push({ ip, ...values })
    }
    
    const data = []
    for (const ip of ips) {
        if (ip.ll) {
            const co2 = await fetch(`http://api.thegreenwebfoundation.org/api/v3/ip-to-co2intensity/${ip.ip}`, {
                method: "GET",
            }).then((response) => response.json());
            
            data.push({...ip, co2: co2})
        }
    }
    // console.log({data})
    // console.log("coordinates", JSON.stringify (data, null, 2))
    return data
} catch (e) {
    console.log("ERROR", e)
}
}


polka()
.get("/", async (req, res) => {
    res.end("Hello world!")
})
  .get('/check/:domain', async(req, res) => {
    const domain = decodeURI(req.params.domain)
    const data = await greentrace(domain)

    const resp = {
        domain,
        location: 'SG',
        data
    }
    res.end(JSON.stringify(resp))
  })
  .listen(3000, () => {
    console.log(`> Running on localhost:3000`);
  });
