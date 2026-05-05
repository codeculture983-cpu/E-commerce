import React from 'react'
import Title from '../Components/Title'
import { assets } from '../assets/assets'
import NewsletterBox from '../Components/NewsletterBox'

const About = () => {
  return (
    <div className="max-w-7xl mx-auto px-4">
      
      {/* ABOUT US */}
      <div className="text-2xl text-center pt-8 border-t">
        <Title text1="ABOUT" text2="US" />

        <div className="my-14 flex flex-col md:flex-row gap-14 items-center">
          
          <img
            src={assets.about_img}
            alt="About Forever"
            className="w-full md:max-w-[420px]"
          />

          <div className="md:w-2/4 text-gray-600 flex flex-col gap-5 text-sm leading-6">
            <p>
              Forever was born out of a passion for innovation and a desire to
              revolutionize the way people shop online. Our journey began with
              a simple idea: to provide a platform where customers can easily
              discover, explore, and purchase a wide range of products from the
              comfort of their homes.
            </p>

            <p>
              Since our inception, we’ve worked tirelessly to curate a diverse
              selection of high-quality products that cater to every taste and
              preference. From fashion and beauty to electronics and home
              essentials, we offer an extensive collection sourced from trusted
              brands and suppliers.
            </p>

            <p className="font-semibold text-gray-800 mt-4">
              Our Mission
            </p>

            <p>
              Our mission at Forever is to empower customers with choice,
              convenience, and confidence. We’re dedicated to providing a
              seamless shopping experience that exceeds expectations, from
              browsing and ordering to delivery and beyond.
            </p>
          </div>
        </div>
      </div>

      {/* WHY CHOOSE US */}
      <div className="py-12">
        <Title text1="WHY" text2="CHOOSE US" />

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          
          <div className="border px-8 py-10">
            <p className="font-semibold mb-3">Quality Assurance</p>
            <p className="text-gray-600">
              We meticulously select and vet each product to ensure it meets our
              stringent quality standards.
            </p>
          </div>

          <div className="border px-8 py-10">
            <p className="font-semibold mb-3">Convenience</p>
            <p className="text-gray-600">
              With our user-friendly interface and hassle-free ordering process,
              shopping has never been easier.
            </p>
          </div>

          <div className="border px-8 py-10">
            <p className="font-semibold mb-3">
              Exceptional Customer Service
            </p>
            <p className="text-gray-600">
              Our team of dedicated professionals is here to assist you the way,
              ensuring your satisfaction is our top priority.
            </p>
          </div>

        </div>
      </div>

      {/* NEWSLETTER */}
      <NewsletterBox />

    </div>
  )
}

export default About
