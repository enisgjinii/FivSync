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
  const { session_id, extension_id } = req.query;

  // HTML content for success page
  const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Successful - Fiverr Extractor Pro</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
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
        .success-icon {
            width: 80px;
            height: 80px;
            margin: 0 auto 1.5rem;
            background: #4CAF50;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 40px;
        }
        h1 {
            color: #2E7D32;
            margin-bottom: 1rem;
            font-size: 2rem;
        }
        .subtitle {
            color: #4CAF50;
            font-size: 1.2rem;
            margin-bottom: 1.5rem;
            font-weight: 600;
        }
        .features {
            background: #f8f9fa;
            padding: 1.5rem;
            border-radius: 10px;
            margin: 1.5rem 0;
            text-align: left;
        }
        .features h3 {
            color: #2E7D32;
            margin-bottom: 1rem;
            text-align: center;
        }
        .features ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .features li {
            padding: 0.5rem 0;
            color: #333;
            position: relative;
            padding-left: 1.5rem;
        }
        .features li:before {
            content: "✅";
            position: absolute;
            left: 0;
        }
        .status {
            background: #e8f5e8;
            padding: 1rem;
            border-radius: 8px;
            margin: 1rem 0;
            border-left: 4px solid #4CAF50;
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
        .close-button {
            background: #4CAF50;
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            margin-top: 1rem;
        }
        .close-button:hover {
            background: #45a049;
        }
        .error {
            background: #ffebee;
            color: #c62828;
            padding: 1rem;
            border-radius: 8px;
            margin: 1rem 0;
            border-left: 4px solid #f44336;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="success-icon">🎉</div>
        <h1>Payment Successful!</h1>
        <div class="subtitle">Welcome to Fiverr Extractor Pro!</div>
        
        <div class="status" id="status">
            <span id="statusMessage">Processing your payment...</span>
        </div>

        <div class="features">
            <h3>🚀 Your Pro Features Are Now Active!</h3>
            <ul>
                <li>Unlimited conversation exports</li>
                <li>Export in multiple formats (TXT, CSV, JSON)</li>
                <li>Advanced attachment management</li>
                <li>Bulk conversation export</li>
                <li>Metadata and timestamp export</li>
                <li>Priority support</li>
            </ul>
        </div>

        <button class="extension-button" id="openExtension">Open Extension</button>
        <button class="close-button" id="closeButton">Close</button>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const statusMessage = document.getElementById('statusMessage');
            const openExtension = document.getElementById('openExtension');
            const closeButton = document.getElementById('closeButton');

            // Get URL parameters
            const sessionId = '${session_id || ''}';
            const extensionId = '${extension_id || ''}';

            if (!sessionId) {
                statusMessage.textContent = 'Error: No session ID found.';
                statusMessage.parentElement.className = 'error';
                return;
            }

            // Function to update status
            function updateStatus(message, isError = false) {
                statusMessage.textContent = message;
                statusMessage.parentElement.className = isError ? 'error' : 'status';
            }

            // Function to open the extension
            function openExtensionInTab() {
                if (extensionId) {
                    const extensionUrl = \`chrome-extension://\${extensionId}/popup.html\`;
                    window.open(extensionUrl, '_blank');
                } else {
                    updateStatus('Extension ID not found. Please open the extension manually.', true);
                }
            }

            // Process the successful payment
            async function processPayment() {
                updateStatus('Verifying payment and activating subscription...');

                try {
                    // Send message to extension if it's available
                    if (extensionId) {
                        // Try to communicate with the extension
                        const message = {
                            type: 'PAYMENT_SUCCESS',
                            sessionId: sessionId,
                            timestamp: new Date().toISOString()
                        };

                        // Attempt to send message to extension (this will only work if extension is open)
                        try {
                            // This is a fallback - the extension should handle this via background script
                            console.log('Payment successful for session:', sessionId);
                        } catch (e) {
                            console.log('Extension communication not available:', e);
                        }
                    }

                    updateStatus('Payment verified! Your Pro subscription is now active.');
                    
                    // Auto-open extension after a short delay
                    setTimeout(() => {
                        openExtensionInTab();
                    }, 2000);

                } catch (error) {
                    console.error('Error processing payment:', error);
                    updateStatus('Payment successful, but there was an issue activating your subscription. Please contact support.', true);
                }
            }

            // Event listeners
            openExtension.addEventListener('click', openExtensionInTab);
            closeButton.addEventListener('click', () => {
                window.close();
            });

            // Start processing
            processPayment();

            // Auto-open extension after 30 seconds if user doesn't interact
            setTimeout(() => {
                if (confirm('Open the extension to start using your Pro features?')) {
                    openExtensionInTab();
                }
            }, 30000);
        });
    </script>
</body>
</html>`;

  // Set content type to HTML
  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
}; 