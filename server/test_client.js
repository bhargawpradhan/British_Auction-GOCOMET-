const axios = require('axios');

async function testCreate() {
  try {
    const login = await axios.post('http://127.0.0.1:5000/api/auth/login', {
      email: 'bhargawpradhan@gmail.com',
      password: 'Vicky@1234'
    });
    
    const token = login.data.token;
    console.log("Logged in. Token:", token.slice(0, 20) + '...');
    
    const start = new Date();
    const end = new Date(start.getTime() + 60*60*1000);
    const forced = new Date(end.getTime() + 60*60*1000);

    const res = await axios.post('http://127.0.0.1:5000/api/auctions', {
      title: "Test RFQ",
      description: "Testing deployment",
      basePrice: 500000,
      minIncrement: 1000,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      forcedCloseTime: forced.toISOString(),
      serviceDate: new Date().toISOString(),
      britishConfig: {
        triggerWindow: 10,
        extensionDuration: 5,
        extensionTrigger: "bid_received"
      }
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log("CREATED:", res.data);
  } catch (err) {
    if (err.response) {
      console.error("FAiled to DEPLOY API ERROR:", err.response.data);
    } else {
      console.error("General Error:", err.message);
    }
  }
}

testCreate();
