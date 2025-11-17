"use client";

import React from 'react';
import { IoSearch } from 'react-icons/io5';

interface SearchProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

const Search = ({ value, onChange, placeholder = "Search..."}: SearchProps) => {

  const onClickIcon = () => {
    console.log("Searching:", value);
  }

  return (
    <div className='flex items-center px-5'
        style={{
          width:'500px',
          height:'60px',
          background: '#FFFFFF',
          border: '2px solid #E5713A',
          borderRadius: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
    >
      <input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{
          fontWeight: 400,
          fontSize: '20px',
          lineHeight: '24px',
          letterSpacing: '0.05em',
          color: '#5B5B5B',
          width: '100%',
          height: '24px',
          flexGrow:'1',
          outline:'none'
        }}
      />

      <IoSearch
        size={24}
        color={"#E5713A"}
        className='font-bold'
        style={{marginLeft:'10px', cursor:'pointer'}}
        onClick={onClickIcon}
      />
    </div>
  )
}

export default Search;
