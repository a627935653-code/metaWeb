import React from 'react'
import useFetch from './useFetch'
import { useQuery } from '@tanstack/react-query'

export default function useBoxClassification() {

    const { fetchPost } = useFetch()

   const query = useQuery({
       queryKey: ["boxClassification"],
       queryFn: async (params) => {
         const res = await fetchPost({
           path: "/box/cate/lst",
         });
         return res?.data
       },
     });

     return query?.data?.data?.map((item)=>{
        return ({
            value: String(item.id),
            label: String(item.name),
        })
     }) || []
}
