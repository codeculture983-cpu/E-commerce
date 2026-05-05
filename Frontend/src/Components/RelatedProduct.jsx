/* eslint-disable react-hooks/purity */
/* eslint-disable no-unused-vars */



import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../Context/ShopContext'
import Title from './Title'
import ProductItem from './ProductItem'

const RelatedProduct = ({ category, subCategory }) => {
  const { products } = useContext(ShopContext)
  const [related, setRelated] = useState([])

  useEffect(() => {
    if (!Array.isArray(products) || products.length === 0) return

    const productCopy = products.filter(
      (item) =>
        item.category === category &&
        item.subCategory === subCategory
    )

    setRelated(productCopy.slice(0, 5))
  }, [products, category, subCategory])

  if (!related || related.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        No related products found
      </div>
    )
  }

  return (
    <div className="my-24">
      <div className="text-center text-3xl py-2">
        <Title text1="RELATED" text2="PRODUCT" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
        {related.map((item, index) => {
          // Safe defaults
          const id = item._id?.$oid || item._id || Math.random().toString()
          const imageUrl =
            Array.isArray(item.images) && item.images.length > 0
              ? item.images[0]
              : '/placeholder.png'
          const name = item.name || 'Unnamed Product'
          const price = item.price || 0

          return (
            <ProductItem
              key={id}
              id={id}
              name={name}
              price={price}
              image={imageUrl}
            />
          )
        })}
      </div>
    </div>
  )
}

export default RelatedProduct
