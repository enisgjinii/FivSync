module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only handle GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get URL parameters
  const { extension_id } = req.query;

  // HTML content for cancel page
  const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Cancelled - Fiverr Extractor</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
            margin: 0;
            padding: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            background: white;
            padding: 2rem;
            border-radius: 15px;
            box-shadow: 0 15px 35px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 500px;
            width: 90%;
        }
        .cancel-icon {
            width: 80px;
            height: 80px;
            margin: 0 auto 1.5rem;
            background: #ff9800;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 40px;
        }
        h1 {
            color: #e65100;
            margin-bottom: 1rem;
            font-size: 2rem;
        }
        .subtitle {
            color: #ff9800;
            font-size: 1.2rem;
            margin-bottom: 1.5rem;
            font-weight: 600;
        }
        .message {
            background: #fff3e0;
            padding: 1.5rem;
            border-radius: 10px;
            margin: 1.5rem 0;
            text-align: left;
            border-left: 4px solid #ff9800;
        }
        .extension-button {
            background: #4285f4;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            margin: 1rem auto;
            transition: background 0.2s;
        }
        .extension-button:hover {
            background: #3367d6;
        }
        .retry-button {
            background: #ff9800;
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            margin-top: 1rem;
        }
        .retry-button:hover {
            background: #f57c00;
        }
        .close-button {
            background: #757575;
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            margin-top: 1rem;
            margin-left: 10px;
        }
        .close-button:hover {
            background: #616161;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="cancel-icon">⚠️</div>
        <h1>Payment Cancelled</h1>
        <div class="subtitle">No worries! You can try again anytime.</div>
        
        <div class="message">
            <h3>What happened?</h3>
            <p>Your payment was cancelled. This could be because:</p>
            <ul>
                <li>You closed the payment window</li>
                <li>You decided not to proceed with the payment</li>
                <li>There was a temporary issue with the payment system</li>
            </ul>
            <p><strong>Don't worry!</strong> You can try the payment again whenever you're ready.</p>
        </div>

        <button class="extension-button" id="openExtension">Open Extension</button>
        <button class="retry-button" id="retryPayment">Try Payment Again</button>
        <button class="close-button" id="closeButton">Close</button>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const openExtension = document.getElementById('openExtension');
            const retryPayment = document.getElementById('retryPayment');
            const closeButton = document.getElementById('closeButton');

            // Get URL parameters
            const extensionId = '${extension_id || ''}';

            // Function to open the extension
            function openExtensionInTab() {
                if (extensionId) {
                    const extensionUrl = \`chrome-extension://\${extensionId}/popup.html\`;
                    window.open(extensionUrl, '_blank');
                } else {
                    alert('Extension ID not found. Please open the extension manually.');
                }
            }

            // Function to retry payment
            function retryPaymentProcess() {
                if (extensionId) {
                    const checkoutUrl = \`chrome-extension://\${extensionId}/checkout.html\`;
                    window.open(checkoutUrl, '_blank');
                } else {
                    alert('Extension ID not found. Please open the extension and try payment again.');
                }
            }

            // Event listeners
            openExtension.addEventListener('click', openExtensionInTab);
            retryPayment.addEventListener('click', retryPaymentProcess);
            closeButton.addEventListener('click', () => {
                window.close();
            });

            // Auto-open extension after 10 seconds if user doesn't interact
            setTimeout(() => {
                if (confirm('Open the extension to try payment again?')) {
                    openExtensionInTab();
                }
            }, 10000);
        });
    </script>
</body>
</html>`;

  // Set content type to HTML
  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
}; 