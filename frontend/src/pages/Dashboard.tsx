import Greeting from "../components/Greeting"
import QuoteCard from "../components/QuoteCard"
import StudyProgress from "../components/StudyProgress"

export default function Dashboard(){

  return(

    <div>

      <Greeting />

      <QuoteCard />

      <StudyProgress />

      <button>
        Continue Studying
      </button>

    </div>

  )

}