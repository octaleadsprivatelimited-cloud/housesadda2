import { useState, useEffect } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { propertiesAPI } from '@/lib/api';

interface Category {
  id: number;
  count: string;
  title: string;
  image: string;
  link: string;
}

const categoryImages = [
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=600&h=400&fit=crop&q=80',
];

export function CategoryCards() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const properties = await propertiesAPI.getAll({ active: true });
      
      // Count properties by different categories
      const totalCount = properties.length;
      const saleCount = properties.filter((p: any) => p.transactionType === 'Sale').length;
      const rentCount = properties.filter((p: any) => p.transactionType === 'Rent').length;
      const featuredCount = properties.filter((p: any) => p.isFeatured).length;

      setCategories([
        {
          id: 1,
          count: totalCount.toString(),
          title: 'All Properties',
          image: categoryImages[0],
          link: '/properties',
        },
        {
          id: 2,
          count: saleCount.toString(),
          title: 'Properties for Sale',
          image: categoryImages[1],
          link: '/properties?intent=buy',
        },
        {
          id: 3,
          count: rentCount.toString(),
          title: 'Properties for Rent',
          image: categoryImages[2],
          link: '/properties?intent=rent',
        },
        {
          id: 4,
          count: featuredCount.toString(),
          title: 'Featured Properties',
          image: categoryImages[3],
          link: '/properties?featured=true',
        },
      ]);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([
        { id: 1, count: '0', title: 'All Properties', image: categoryImages[0], link: '/properties' },
        { id: 2, count: '0', title: 'Properties for Sale', image: categoryImages[1], link: '/properties?intent=buy' },
        { id: 3, count: '0', title: 'Properties for Rent', image: categoryImages[2], link: '/properties?intent=rent' },
        { id: 4, count: '0', title: 'Featured Properties', image: categoryImages[3], link: '/properties?featured=true' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <section className="py-10 md:py-14 bg-background">
        <div className="container flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-16 bg-white relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-40" />
      
      <div className="container relative z-10">
        <div className="text-center mb-10">
          <span className="inline-block px-4 py-1.5 bg-blue-500/10 text-blue-600 text-sm font-semibold rounded-full mb-4">
            Quick Access
          </span>
          <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3">We've got properties for everyone</h2>
          <p className="text-gray-500">Explore our diverse collection of properties</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={category.link}
              className="group relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              <img 
                src={category.image} 
                alt={category.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-5 text-white">
                <p className="text-3xl md:text-4xl font-bold mb-1">{category.count}</p>
                <p className="text-sm md:text-base font-medium opacity-90">{category.title}</p>
                <span className="inline-flex items-center gap-1 text-sm mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  Explore <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
