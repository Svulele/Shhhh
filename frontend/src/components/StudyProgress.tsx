export default function StudyProgress() {

    const progress = 35
  
    return (
      <div>
  
        <h2>Java 101</h2>
  
        <progress value={progress} max="100"></progress>
  
        <p>{progress}% completed</p>
  
      </div>
    )
  
  }