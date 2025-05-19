"use client"

import { getAccessToken } from "@auth0/nextjs-auth0"

export default function Component() {
  async function getToken() {
    try {
        const response = await fetch('https://tradetrackr.ca.auth0.com/oauth/token', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            "client_id":"lwirrAgWfqwkE2xVPLwJjVdtOWXkYu3S",
            "client_secret":"YGaCK2hJP9MNxMMOlg5KWm8wEHr2P2920pZ3-5E6HDsvmgaajcEZ0Ae7-YF0Xl6U",
            "audience":"https://localhost:44395/api",
            "grant_type":"client_credentials"
          }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error('Error fetching token:', error);
    }
  };
  
  async function fetchData() {
    try {
      const token = await getToken()
      // call external API with token...
      console.log(token)
      const res = await fetch("https://localhost:44395/api/Clients", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        throw new Error("Failed to fetch data")
      }
      const data = await res.json()
      console.log(data)
    } catch (err) {
      // err will be an instance of AccessTokenError if an access token could not be obtained
      console.error(err)
    }
  }

  return (
    <main>
      <button onClick={fetchData}>Fetch Data</button>
    </main>
  )
}