/* eslint-disable react-hooks/purity */
import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../Context/ShopContext';
import Title from './Title';
import ProductItem from './ProductItem';

const BestSeller = () => {
  const { products } = useContext(ShopContext);
  const [bestSeller, setBestSeller] = useState([]);

  useEffect(() => {
    if (!Array.isArray(products) || products.length === 0) return;

    const bestProduct = products.filter(item => item.bestseller);
    setBestSeller(bestProduct.slice(0, 5));
  }, [products]);

  if (!bestSeller || bestSeller.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        No bestsellers available
      </div>
    );
  }

  return (
    <div className="my-10">
      <div className="text-center text-3xl py-8">
        <Title text1="BEST" text2="SELLERS" />
        <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600">
          Shop the bestsellers that everyone’s talking about.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
        {bestSeller.map((item) => {
          // Safe defaults
          const id = item._id?.$oid || item._id || Math.random().toString();
          const imageUrl =
            Array.isArray(item.images) && item.images.length > 0
              ? item.images[0]
              : '/placeholder.png';
          const name = item.name || 'Unnamed Product';
          const price = item.price || 0;

          return (
            <ProductItem
              key={id}
              id={id}
              image={imageUrl}
              name={name}
              price={price}
            />
          );
        })}
      </div>
    </div>
  );
};

export default BestSeller;
