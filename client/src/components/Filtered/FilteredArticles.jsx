import { useState, Fragment } from 'react';
import React from "react";
import {
  Dialog,
  Transition,
  Menu,
  MenuButton,
  MenuItems,
  MenuItem,
} from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { FunnelIcon, Squares2X2Icon } from '@heroicons/react/20/solid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import FilterDisclosure from './FilterDisclosure';
import RangeSlider from './RangeSlider';

const sortOptions = [
  { name: 'Most Popular', href: '#', current: true },
  { name: 'Best Rating', href: '#', current: false },
  { name: 'Newest', href: '#', current: false },
  { name: 'Price: Low to High', href: '#', current: false },
  { name: 'Price: High to Low', href: '#', current: false },
];

const FilteredArticles = () => {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  
  const handlePrixChange = (value) => {
    console.log('Prix:', value);
  };

  const handlePoidsChange = (value) => {
    console.log('Poids:', value);
  };

  const handlePrixReset = () => {
    console.log('Prix reset');
  };

  const handlePoidsReset = () => {
    console.log('Poids reset');
  };

  const filters = [
    {
      name: 'Filtres',
    },
    {
      id: 'Type de produits',
      name: 'Type de produits',
      options: [
        { value: 'Instruments', label: 'Instruments', checked: false },
        { value: 'Vinyles', label: 'Vinyles', checked: false },
        { value: 'Goddies', label: 'Goddies', checked: true },
      ],
    },
    {
      id: 'Marque',
      name: 'Marque',
      options: [
        { value: 'Shiver', label: 'Shiver', checked: false },
        { value: 'Takamine', label: 'Takamine', checked: false },
        { value: 'Gibson', label: 'Gibson', checked: true },
        { value: 'Yamaha', label: 'Yamaha', checked: false },
      ],
    },
    {
      id: 'Prix',
      name: 'Prix',
      component: <RangeSlider min={0} max={100} step={1} onChange={handlePrixChange} onReset={handlePrixReset} />,
    },
    {
      id: 'Taille',
      name: 'Taille',
      options: [
        { value: '33', label: '33', checked: false },
        { value: '45', label: '45', checked: false },
        { value: 'XXL', label: 'XXL', checked: true },
        { value: 'XL', label: 'XL', checked: false },
        { value: 'L', label: 'L', checked: false },
        { value: 'M', label: 'M', checked: false },
        { value: 'S', label: 'S', checked: false },
        { value: 'XS', label: 'XS', checked: false },
      ],
    },
    {
      id: 'Poids',
      name: 'Poids',
      component: <RangeSlider min={0} max={50} step={1} onChange={handlePoidsChange} onReset={handlePoidsReset} />,
    },
  ];

  function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
  }

  return (
    <div className="bg-white">
      <div>
        {/* Mobile filter dialog */}
        <Transition.Root show={mobileFiltersOpen} as={Fragment}>
          <Dialog as="div" className="relative z-40 lg:hidden" onClose={setMobileFiltersOpen}>
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-25" />
            </Transition.Child>

            <div className="fixed inset-0 z-40 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white py-4 pb-12 shadow-xl">
                  <div className="flex items-center justify-between px-4">
                    <h2 className="text-lg font-medium text-gray-900">Filters</h2>
                    <button
                      type="button"
                      className="-mr-2 flex h-10 w-10 items-center justify-center rounded-md bg-white p-2 text-gray-400"
                      onClick={() => setMobileFiltersOpen(false)}
                    >
                      <span className="sr-only">Close menu</span>
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>

                  {/* Filters */}
                  <form className="mt-4 border-t border-gray-200">
                    {filters.map((section) => (
                      <FilterDisclosure key={section.id} section={section} />
                    ))}
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>

        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-baseline justify-between border-b border-gray-200 pb-6 pt-24">
            <div className="flex items-center">
              <Menu as="div" className="relative inline-block text-left">
                <div>
                  <MenuButton className="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
                    Sort
                    <FontAwesomeIcon icon={faChevronDown} className="-mr-1 ml-1 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500" />
                  </MenuButton>
                </div>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <MenuItems className="absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-md bg-white shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      {sortOptions.map((option) => (
                        <MenuItem key={option.name}>
                          {({ active }) => (
                            <a
                              href={option.href}
                              className={classNames(
                                option.current ? 'font-medium text-gray-900' : 'text-gray-500',
                                active ? 'bg-gray-100' : '',
                                'block px-4 py-2 text-sm'
                              )}
                            >
                              {option.name}
                            </a>
                          )}
                        </MenuItem>
                      ))}
                    </div>
                  </MenuItems>
                </Transition>
              </Menu>

              <button type="button" className="-m-2 ml-5 p-2 text-gray-400 hover:text-gray-500 sm:ml-7">
                <span className="sr-only">View grid</span>
                <Squares2X2Icon className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                className="-m-2 ml-4 p-2 text-gray-400 hover:text-gray-500 sm:ml-6 lg:hidden"
                onClick={() => setMobileFiltersOpen(true)}
              >
                <span className="sr-only">Filters</span>
                <FunnelIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>

          <section aria-labelledby="products-heading" className="pb-24 pt-6">
            <h2 id="products-heading" className="sr-only">
              Products
            </h2>

            <div className="grid grid-cols-1 gap-x-8 gap-y-10">
              
              <form className="hidden lg:block">
                {filters.map((section) => (
                  <FilterDisclosure key={section.id} section={section} />
                
                ))}
              </form>
          
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default FilteredArticles;
