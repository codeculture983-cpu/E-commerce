/* eslint-disable react-hooks/purity */
import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../Context/ShopContext';
import Title from './Title';
import ProductItem from './ProductItem';

const LatestCollection = () => {
  const { products } = useContext(ShopContext);
  const [latestProducts, setLatestProducts] = useState([]);

  useEffect(() => {
    if (Array.isArray(products) && products.length > 0) {
      setLatestProducts(products.slice(0, 10));
    } else {
      setLatestProducts([]);
    }
  }, [products]);

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        No products available
      </div>
    );
  }

  return (
    <div className="my-10">
      <div className="text-center py-8 text-3xl">
        <Title text1="LATEST " text2="COLLECTIONS" />
        <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600">
          Explore our newest arrivals and stay ahead of the trends.
        </p>
      </div>

      {/* Rendering Products */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
        {latestProducts.map((item) => {
          // Safe defaults
          const id = item._id?.$oid || item._id || Math.random().toString();
          const imageUrl =Array.isArray(item.images) && item.images.length > 0
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

export default LatestCollection;
