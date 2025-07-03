const http = require('http');

const { createClient } = require('@supabase/supabase-js');

const cloudinary = require('cloudinary').v2;

// Initialize Supabase
const supabaseUrl = 'https://ijhvfampizuvqwjwtyqt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqaHZmYW1waXp1dnF3and0eXF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxNjk2MTQsImV4cCI6MjA2MDc0NTYxNH0.vyRMSFf7fAOSAFxilMZipIHqzg-1xbn5OnsZZhk7CaM';
const supabase = createClient(supabaseUrl, supabaseKey);

// Define the async function
async function supabaseGetFieldsJSON() {
    console.log('heeeeeeeeeeeeeeeeeeeeee');
    const { data, error } = await supabase
      .from('fields')
      .select('*');
  
    if (error) {
      console.error('Error fetching data:', error.message);
      return null;
    }
  
    console.log('Products:', data);
    return data;
}
  
// Define the async function
async function supabaseGetCatalogsJSON() {
    const { data, error } = await supabase
      .from('catalogs')
      .select('*');
  
    if (error) {
      console.error('Error fetching data:', error.message);
      return null;
    }
  
    console.log('Products:', data);
    return data;
}
  
// Define the async function
async function supabaseGetProductsJSON() {
    const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('product_id', {ascending: true});

    if (error) {
    console.error('Error fetching data:', error.message);
    return null;
    }

    console.log('Products:', data);
    return data;
}
  
const server = http.createServer(async (req, res) => {

    // Add CORS headers to allow requests from any origin (you can replace * with a specific domain if needed)
    // Handle CORS for ALL requests
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins (you can restrict if needed)
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); // Allowed methods
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Allowed headers

    if(req.method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        });
        res.end();
        return;
    } else if(req.method === 'GET') {
        switch (req.url) {
            case '/fields': {
                try {
                    let data = await supabaseGetFieldsJSON();
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(data));
                } catch (error) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Internal Server Error' }));
                }
            }
            break;

            case '/catalogs': {
                try {
                    let data = await supabaseGetCatalogsJSON();
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(data));
                } catch (error) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Internal Server Error' }));
                }
                
            }
            break;

            case '/products': {
                console.log('heeeeeeeeeeeeeeeeeeeeee');
                try {
                    let data = await supabaseGetProductsJSON();
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(data));
                } catch (error) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Internal Server Error' }));
                }
                
            }
            break;
        
            default: {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Not Found');
            }
            break;
        }
    } else if (req.method === 'POST') {
        switch (req.url) {
            case '/order': {
                let body = '';

                req.on('data', chunk => {
                    body += chunk;
                });

                req.on('end', () => {
                    try {
                        const formObject = JSON.parse(body);
                        console.log('Received Form Object:', formObject);

                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ message: 'Form received successfully!' }));

                        insertProductsOrder(formObject);

                    } catch (error) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Invalid JSON data' }));
                    }
                });
            }
            break;

            case '/personalize': {
                let body = '';

                req.on('data', chunk => {
                    body += chunk;
                });

                req.on('end', async () => {
                    try {
                        const formObject = JSON.parse(body);
                        console.log('Received Form Object:', formObject);

                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ message: 'Form received successfully!' }));

                        const imageUrl = await uploadBase64Image(formObject.image_input);

                        insertPersonalizeOrder(formObject, imageUrl);

                    } catch (error) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Invalid JSON data' }));
                    }
                });
            }
            break;

            default:
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Not Found');
                break;
        }
    }
});

server.listen(3000, () => {
  console.log('Server is listening on http://localhost:3000');
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Cloudinary configuration
cloudinary.config({ 
    cloud_name: 'dcorvb30c', 
    api_key: '458852964626743', 
    api_secret: '5oCK7baiPPM_EW-iVnxVoKcUbWc' 
});

async function uploadBase64Image(base64) {
    const result = await cloudinary.uploader.upload(base64);
    console.log(result.secure_url);
    return result.secure_url; 
}

async function insertPersonalizeOrder(orderData, imageUrl) {
    const { data, error } = await supabase
    .from('personalized_orders')
    .insert([
        {
            customer_first_name: orderData.first_name,
            customer_last_name: orderData.last_name,
            customer_email: orderData.email,
            customer_phone_num: orderData.phone,
            customer_address: orderData.address,
            personalized_image: imageUrl,
            quantity: orderData.quantity
        }
    ])

    if(error) {
        console.error('Error inserting data', error);
    } else {
        console.log('Data inserted successfully', data);
    }
};

async function insertProductsOrder(orderData) {
    const { data, error } = await supabase
    .from('products_orders')
    .insert([
        {
            customer_first_name: orderData.first_name,
            customer_last_name: orderData.last_name,
            customer_email: orderData.email,
            customer_phone_num: orderData.phone,
            customer_address: orderData.address,
            quantity: orderData.quantity,
            product_id: orderData.product_id
        }
    ])

    if(error) {
        console.error('Error inserting data', error);
    } else {
        console.log('Data inserted successfully', data);
    }
};