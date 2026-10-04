import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Tutorials() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const runTutorial = (tutorialId) => {
    setOpen(false);
    
    let driverObj;
    
    const autoAdvance = (el) => {
      if (el) {
        el.addEventListener('click', () => {
          setTimeout(() => {
            if (driverObj) driverObj.moveNext();
          }, 250);
        }, { once: true });
      }
    };

    let steps = [];
    if (tutorialId === 'cart') {
      steps = [
        {
          element: '#nav-drops',
          onHighlightStarted: autoAdvance,
          popover: { title: 'Step 1: The Catalog', description: 'Click here to make sure you are on the Drops page.', side: "bottom", align: 'start' }
        },
        {
          element: '.product-card:last-child', // Bug ??? is always the last card
          onHighlightStarted: autoAdvance,
          popover: { title: 'Step 2: The Secret Bug', description: 'The mysterious Bug ??? at the end costs $999. Click it. Your goal: get it for $0 or less.', side: "left", align: 'start' }
        },
        {
          element: '#add-to-box-btn',
          onHighlightStarted: autoAdvance,
          popover: { title: 'Step 3: Add it to your box', description: 'Click it. Nothing is sent to the server yet: your box lives in the browser.', side: "left", align: 'start' }
        },
        {
          element: '#nav-cart',
          onHighlightStarted: autoAdvance,
          popover: { title: 'Step 4: Open your box', description: 'You need to be logged in to check out, so sign in first if you have not.', side: "bottom", align: 'start' }
        },
        {
          element: '#checkout-btn',
          popover: { title: 'Step 5: Intercept', description: 'Before clicking Checkout, open DevTools (F12) and go to the Network tab. Then click it and inspect the POST /api/cart/checkout request. Look at its JSON body: who decides the price?', side: "top", align: 'start' }
        },
        {
          popover: { title: 'Step 6: Exploit', description: 'The price travels in the request, so you can change it. Copy the request as fetch from DevTools, edit unit_price, and replay it from the console (or intercept it with Burp). The goal is Bug ??? for $0 or less.' }
        }
      ];
    } else if (tutorialId === 'xss') {
      steps = [
        {
          element: '.product-card', 
          onHighlightStarted: autoAdvance,
          popover: { title: 'Step 1: Product Page', description: 'Click on any product to go to its details page where you can see the reviews.', side: "right" }
        },
        {
          element: '#review-textarea',
          popover: { title: 'Step 2: Payload Injection', description: 'This form does not sanitize HTML. Try injecting an element with an event handler, like &lt;img src=x onerror=alert(1)&gt;. (A plain script tag will not run when inserted this way: browsers ignore scripts added through innerHTML.)', side: "top" }
        },
        {
          element: '#submit-review-btn',
          popover: { title: 'Step 3: Stored XSS', description: 'When you submit it, the payload is saved in the database. Anyone viewing this page (including the Admin) will execute your script!', side: "left" }
        }
      ];
    } else if (tutorialId === 'sqli') {
      steps = [
        {
          element: '#newsletter-input',
          popover: { title: 'Step 1: The Input', description: 'This newsletter form looks innocent, but it connects directly to the database.', side: "top" }
        },
        {
          popover: { title: 'Step 2: SQL Injection', description: 'Try typing a SQL injection payload like: admin\' OR \'1\'=\'1. The server concatenates this raw string directly into the SQL query, bypassing normal checks.' }
        }
      ];
    } else if (tutorialId === 'idor') {
      steps = [
        {
          element: '#nav-collection',
          onHighlightStarted: autoAdvance,
          popover: { title: 'Step 1: Your Collection', description: 'Make sure you are logged in, then head to your Collection to see your past orders.', side: "bottom" }
        },
        {
          popover: { title: 'Step 2: Inspect the Request', description: 'When you click on one of your drops to view details, watch the Network tab. The frontend requests /api/orders/{id}.' }
        },
        {
          popover: { title: 'Step 3: IDOR Exploit', description: 'What happens if you just change that number to 1? (e.g. /api/orders/1). Try making the request manually or intercepting it. Does the server check if order #1 belongs to you?' }
        }
      ];
    } else if (tutorialId === 'payment') {
      steps = [
        {
          popover: { title: 'Step 1: The Setup', description: 'First, add any item to your box and go to Checkout. Place the order WITHOUT paying.' }
        },
        {
          element: '#nav-collection',
          onHighlightStarted: autoAdvance,
          popover: { title: 'Step 2: Pending Order', description: 'Go to your Collection and click your pending order to open its details. You will see a "Complete Payment" button there.', side: "bottom" }
        },
        {
          popover: { title: 'Step 3: The Exploit', description: 'Click Complete Payment but INTERCEPT the request to /api/orders/{id}/pay. The server blindly trusts the client. Just send {"status": "success"} in the JSON body!' }
        }
      ];
    }

    driverObj = driver({
      showProgress: true,
      steps: steps,
      nextBtnText: 'Next',
      prevBtnText: 'Back',
      doneBtnText: 'Got it',
      allowClose: true,
    });

    driverObj.drive();
  };

  return (
    <div style={{ position: 'fixed', bottom: '20px', left: '20px', zIndex: 1000 }}>
      {open ? (
        <div style={{ 
          backgroundColor: 'var(--bg-card)', 
          border: '1px solid var(--border)', 
          borderRadius: '12px', 
          padding: '16px', 
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          minWidth: '200px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>Hacking Instructor</span>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>×</button>
          </div>
          
          <button 
            onClick={() => runTutorial('cart')}
            style={{ textAlign: 'left', padding: '8px 12px', fontSize: '12px', borderRadius: '6px', background: 'var(--bg)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text)' }}
          >
            🛒 Challenge 1: Cart Logic
          </button>
          <button 
            onClick={() => runTutorial('xss')}
            style={{ textAlign: 'left', padding: '8px 12px', fontSize: '12px', borderRadius: '6px', background: 'var(--bg)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text)' }}
          >
            📝 Challenge 2: Stored XSS
          </button>
          <button 
            onClick={() => runTutorial('idor')}
            style={{ textAlign: 'left', padding: '8px 12px', fontSize: '12px', borderRadius: '6px', background: 'var(--bg)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text)' }}
          >
            🕵️ Challenge 3: Leaked Molds (IDOR)
          </button>
          <button 
            onClick={() => runTutorial('payment')}
            style={{ textAlign: 'left', padding: '8px 12px', fontSize: '12px', borderRadius: '6px', background: 'var(--bg)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text)' }}
          >
            💳 Challenge 4: Payment Bypass
          </button>
          <button 
            onClick={() => runTutorial('sqli')}
            style={{ textAlign: 'left', padding: '8px 12px', fontSize: '12px', borderRadius: '6px', background: 'var(--bg)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text)' }}
          >
            💉 Challenge 5: Newsletter SQLi
          </button>
        </div>
      ) : (
        <button 
          onClick={() => setOpen(true)}
          style={{ 
            backgroundColor: 'transparent', 
            border: 'none', 
            width: '140px', 
            height: '100px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            cursor: 'pointer',
            padding: 0,
            filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.2))',
            transition: 'transform 0.2s ease'
          }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1) translateY(-4px)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1) translateY(0)'}
          title="Hacking Instructor"
        >
          <img src="/bug-guide-head.png" alt="Instructor" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </button>
      )}
    </div>
  );
}
