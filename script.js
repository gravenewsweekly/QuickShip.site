// scripts/app.js
const JSONBIN_API_KEY = '$2a$10$8SeDUJzv4acS6nenuOTkvuqsLH0m3NtLqqowNenZ1k10HzXzjjX1q';
const JSONBIN_BIN_ID = '6818e3298561e97a500e4bfb';

async function fetchRates() {
    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`, {
            headers: {
                'X-Master-Key': JSONBIN_API_KEY
            }
        });
        const data = await response.json();
        return data.record;
    } catch (error) {
        console.error('Error fetching rates:', error);
        return {
            "DTDC": { "0.5": 80, "1": 120, "2": 200, "5": 350 },
            "Delhivery": { "0.5": 90, "1": 110, "2": 180, "5": 320 },
            "IndiaPost": { "0.5": 50, "1": 80, "2": 150, "5": 250 }
        };
    }
}

function calculateRates() {
    const weight = document.getElementById('weight').value;
    const fromPincode = document.getElementById('fromPincode').value;
    const toPincode = document.getElementById('toPincode').value;

    if (!weight || !fromPincode || !toPincode) {
        alert('Please fill all fields');
        return;
    }

    fetchRates().then(rates => {
        let html = `
            <h3>Available Couriers</h3>
            <table>
                <tr>
                    <th>Courier</th>
                    <th>Estimated Delivery</th>
                    <th>Price</th>
                    <th>Action</th>
                </tr>
        `;

        // Sample delivery times (would normally come from API)
        const deliveryTimes = {
            "DTDC": "2-3 days",
            "Delhivery": "1-2 days",
            "IndiaPost": "3-5 days"
        };

        Object.keys(rates).forEach(courier => {
            const price = rates[courier][weight] || 'NA';
            html += `
                <tr>
                    <td>${courier}</td>
                    <td>${deliveryTimes[courier] || 'NA'}</td>
                    <td>₹${price}</td>
                    <td><button onclick="initPayment('${courier}', ${price}, '${fromPincode}', '${toPincode}', ${weight})">Book Now</button></td>
                </tr>
            `;
        });

        html += `</table>`;
        document.getElementById('results').innerHTML = html;
    });
}

function initPayment(courier, amount, fromPincode, toPincode, weight) {
    const options = {
        key: 'YOUR_RAZORPAY_API_KEY', // Replace with your actual key
        amount: amount * 100, // Razorpay uses paise
        currency: 'INR',
        name: 'QuickShip',
        description: `Courier Booking with ${courier}`,
        image: 'https://example.com/logo.png', // Add your logo
        handler: function(response) {
            // On successful payment
            window.location.href = `confirm.html?courier=${courier}&amount=${amount}&txn=${response.razorpay_payment_id}&from=${fromPincode}&to=${toPincode}&weight=${weight}`;
        },
        prefill: {
            name: 'Customer Name',
            email: 'customer@example.com',
            contact: '9999999999'
        },
        notes: {
            from_pincode: fromPincode,
            to_pincode: toPincode,
            weight: weight
        },
        theme: {
            color: '#3498db'
        }
    };

    const rzp = new Razorpay(options);
    rzp.open();
}
