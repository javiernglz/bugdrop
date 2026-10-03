import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Tutorials() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const runTutorial = (tutorialId) => {
    setOpen(false);
    
    let steps = [];
    if (tutorialId === 'cart') {
      steps = [
        {
          element: '#nav-drops',
          popover: { title: 'Step 1: The Catalog', description: 'Click here to make sure you are on the Drops page.', side: "bottom", align: 'start' }
        },
        {
          element: '.product-card', // Just the first one
          popover: { title: 'Step 2: Pick a Bug', description: 'Click on any Bug to view its details.', side: "right", align: 'start' }
        },
        {
          element: '#add-to-box-btn',
          popover: { title: 'Step 3: Intercept', description: 'Before clicking this, open your DevTools (F12) -> Network tab. Watch the POST request to /api/cart when you click it.', side: "left", align: 'start' }
        },
        {
          popover: { title: 'Step 4: Exploit', description: 'Did you notice the client sends the price? Use "Copy as Fetch" in DevTools, change the price to a negative number, and run it in the console! Then check your Cart.' }
        }
      ];
    } else if (tutorialId === 'xss') {
      steps = [
        {
          element: '.product-card', 
          popover: { title: 'Step 1: Product Page', description: 'Go to any product details page where you can see the reviews.', side: "right" }
        },
        {
          element: '#review-textarea',
          popover: { title: 'Step 2: Payload Injection', description: 'This form doesn\'t sanitize HTML. Try injecting a malicious script tag here, like <script>alert(1)</script>.', side: "top" }
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
    }

    const driverObj = driver({
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
