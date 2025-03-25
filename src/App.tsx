import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [currentAffirmation, setCurrentAffirmation] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [consent, setConsent] = useState(false)

  const getNewAffirmation = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/affirmation')
      const data = await response.json()
      setCurrentAffirmation(data.affirmation)
    } catch (error) {
      console.error('Error fetching affirmation:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!consent) return

    try {
      const phoneNumbers = phoneNumber.split(',').map(num => num.trim())
      
      await Promise.all(phoneNumbers.map(async (to) => {
        await fetch('http://localhost:3001/api/send-affirmation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ to }),
        })
      }))

      setPhoneNumber('')
      setConsent(false)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  useEffect(() => {
    getNewAffirmation()
  }, [])

  return (
    <div className="app">
      <h1>Daily Affirmations</h1>

      <div className="joke-container">
        <div className="joke-question">
          {currentAffirmation}
        </div>
      </div>

      <button onClick={getNewAffirmation}>
        Get New Affirmation
      </button>

      <div className="sms-sender">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter phone numbers separated by commas"
            />
            <span className="input-help">
              Format: +1234567890, +1987654321
            </span>
          </div>

          <div className="consent-group">
            <label className="consent-label">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
              />
              I consent to receive affirmations via SMS at the phone numbers provided
            </label>
          </div>

          <button type="submit" disabled={!consent}>
            Send Affirmation via SMS
          </button>
        </form>
      </div>
    </div>
  )
}

export default App
