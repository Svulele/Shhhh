export default function Greeting() {

  const name = "Sbulele"

  const hour = new Date().getHours()

  let greeting = "Hello"

  if (hour < 12) greeting = "Good morning"
  else if (hour < 18) greeting = "Good afternoon"
  else greeting = "Good evening"

  return (
    <div>
      <h1>{greeting} {name} ☀️</h1>
      <p>Ready to study today?</p>
    </div>
  )

}