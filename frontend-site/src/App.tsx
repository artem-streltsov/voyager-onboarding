import { Flex } from '@chakra-ui/react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { Outlet } from 'react-router-dom'
import "./App.css"

function App() {
  return (
    <Flex flexDir={"column"} style={{ minHeight: "100vh"}}>
      <Navbar />
      <Outlet />
      <Footer />
    </Flex>
  )
}

export default App