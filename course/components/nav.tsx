import React from 'react'

const Navigation = () => {
  return (
    <div className='md:px-16 px-6 py-5 bg-gray-100 space-x-5'>
        <a href="/" className='font-bold text-blue-800'>Home</a>
        <a href="/search" className='font-bold text-blue-800'>Search</a>
    </div>
  )
}

export default Navigation