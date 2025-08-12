import { useState } from 'react'
import './App.css'
import { ChartLineLinear } from "@/components/ui/ChartLineLinear"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className='header'>
        <Card>
        <CardContent>
          <div className='branch-select-card'>
            <h1>Branch Selector</h1>
            <select name="options" className='branch-selection'>
              <option value="1">Option 1</option>
              <option value="2">Option 2</option>
              <option value="3">Option 3</option>
              <option value="4">Option 4</option>
            </select>
            <button className='refresh-button'>Refresh</button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <div className='branch-select-card'>
            <h1>Branches</h1>
            <select name="options" className='branch-selection'>
              <option value="1">Option 1</option>
              <option value="2">Option 2</option>
              <option value="3">Option 3</option>
              <option value="4">Option 4</option>
            </select>
            <button className='refresh-button'>Refresh</button>
          </div>
        </CardContent>
      </Card>
      </div>


      <div className="p-4">
        <ChartLineLinear />
      </div>
    </>
  )
}

export default App
