import { Flex } from '@chakra-ui/react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { Outlet } from 'react-router-dom'
import "./App.css"

function App() {
  return (
    <Flex flexDir={"column"} alignItems={"center"} style={{ minHeight: "100vh", minWidth: "100vw"}}>
      <Navbar />
      <Outlet />
      <Footer />
    </Flex>
  )
}

export default App