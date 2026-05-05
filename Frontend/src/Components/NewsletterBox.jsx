import React from 'react'

const NewsletterBox = () => {

   const onSubmitHandler =(event)=>{
   event.preventDefalt();
   }

  return (
    <div className='text-center'>
        <p className='text-2xl font-medium text-gray-800'>Subscribe now & get 10% off</p>
        <p className='text-gray-400 mt-3'>
            Join our Forever family and enjoy exclusive discounts, new arrivals, and special offers straight to your inbox.
        </p>
        <form onSubmit={onSubmitHandler} className='w-full sm:w-1/2 items-center gap-3 m-auto my-6 border pl-3'>
            <input className='w-full sm:flex-1 outline-none' type="email" placeholder='Enter your E-mail' required />
            <button type="submit" className='bg-black text-white text-xs px-10 py-4'>SUBSCRIBE</button>
        </form>
      
    </div>
  )
}

export default NewsletterBox
