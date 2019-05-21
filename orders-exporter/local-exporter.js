const CLIENT_TOKEN = 'ENTER_YOUR_TOKEN_HERE';

function updateDetails(message) {
    let details = document.querySelector('#details');
    details.textContent = message;
    console.log(message);
}

function simpleDateFormat(date) {
    let month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    let day = date.getUTCDate().toString().padStart(2, '0');
    let formatted =`${date.getUTCFullYear()}-${month}-${day}`;
    return formatted;
}

async function getOrders(clientToken, dateStart, dateEnd) {
    var auth = `${clientToken}:`;
    let headers = new Headers();
    headers.set('Authorization', 'Basic ' + btoa(auth));
    // If there are more than limit (5000) orders on this date - not all will be returned
    let url = `https://api.zinc.io/v1/orders?limit=5000&starting_after=${dateStart.valueOf()}&ending_before=${dateEnd.valueOf()}`;
    console.log(`API request: ${url}`);
    let orders = [];
    try {
        response = await fetch(url, {method: 'GET', headers});
        if (response.ok) {
            queryResult = await response.json();
            if (queryResult.orders) {
                orders = queryResult.orders;
            }
        } else {
            updateDetails(`Error querying orders: status = ${response.status}`)
        }
    } catch (e) {
        console.log('Error querying orders: ', e);
        updateDetails('Error - check console');
    }

    return orders;
}

const csvHeaders = 'request_id,created_on,name,status,order_total,message';

function buildContent(orders) {
    let csv = `${csvHeaders}\r\n`;
    let contentTotal = 0;
    orders.forEach((order) => {
        let line = `${order.request_id},${order._created_at},"${order.request.shipping_address.last_name}, ${order.request.shipping_address.first_name}",`;
        if (order._type && order._type === 'order_response') {
            let total = order.price_components.total / 100;
            line += `success,${total.toFixed(2)},\r\n`;
            contentTotal += total;
        } else {
            line += `error,0,${order.message}\r\n`;
        }
        csv += line;
    });
    csv += `,,,TOTAL,${contentTotal.toFixed(2)}`;
    return csv;
}

// Create a link to an internal object then download it
function download(content, filename) {
    var blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    var link = document.createElement('a');
    var url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

async function exportOrders() {
    let button = document.querySelector('#exportButton');
    button.disabled = true;
    updateDetails('Querying server ...');
    let dateControl = document.querySelector('input[type="date"]');
    let dateStart = new Date(dateControl.value);
    let dateEnd = new Date(dateStart);
    dateEnd.setDate(dateStart.getDate() + 1);
    console.log(`Orders for: ${dateStart.toUTCString()} - ${dateEnd.toUTCString()}`);
    orders = await getOrders(CLIENT_TOKEN, dateStart, dateEnd);
    if (orders.length) {
        let filename = `export_${CLIENT_TOKEN}_${simpleDateFormat(dateStart)}.csv`;
        console.log(`Exporting ${orders.length} orders to ${filename}`);
        let csvContent = buildContent(orders);
        download(csvContent, filename);
        updateDetails(`Exported ${orders.length} orders to ${filename}`);
    } else {
        let msg = 'No orders returned, no export file downloaded.'
        updateDetails(msg);
    }
}

// Set the default date selector value to be yesterday
let dateControl = document.querySelector('input[type="date"]');
let dateDefault = new Date();
dateDefault.setDate(dateDefault.getDate() - 1);
dateControl.value = simpleDateFormat(dateDefault);