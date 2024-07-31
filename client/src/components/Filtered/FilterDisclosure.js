import React from "react";
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { PlusIcon, MinusIcon } from '@heroicons/react/20/solid';
import FilterOptions from './FilterOptions'; 

const FilterDisclosure = ({ section }) => (
  <Disclosure as="div" className="border-t border-gray-200 px-4 py-6 lg:py-0 lg:border-0">
    <h3 className="border mx-2 my-3 flow-root rounded-lg">
      <DisclosureButton className="group flex w-full items-center justify-between border bg-white px-2 py-3 text-gray-400 hover:bg-gray-100">
        <span className="font-medium text-gray-900">{section.name}</span>
        <span className="ml-6 flex items-center">
          <PlusIcon aria-hidden="true" className="h-5 w-5 group-data-[open]:hidden" />
          <MinusIcon aria-hidden="true" className="h-5 w-5 [.group:not([data-open])_&]:hidden" />
        </span>
      </DisclosureButton>
    </h3>
    <DisclosurePanel className="pt-6">
      {section.options ? <FilterOptions options={section.options} sectionId={section.id} /> : section.component}
    </DisclosurePanel>
  </Disclosure>
);

export default FilterDisclosure;
