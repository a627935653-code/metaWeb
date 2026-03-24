
import { useAtomValue } from 'jotai';
import { userInfoAtom } from '@/store/main';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ResponsiveQueryFormWithTable = () => {
  const userInfo = useAtomValue(userInfoAtom)
  const navigate = useNavigate();
  // console.log("userInfo", userInfo)
  useEffect(()=>{
    if(!userInfo?.Authorization) {
      navigate("/login")
    }
  }, [userInfo])
  return (
    <>
      Home
    </>
  );
};

export default ResponsiveQueryFormWithTable;
