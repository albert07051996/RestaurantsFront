import React from 'react';
import { Provider } from 'react-redux';
import { ConfigProvider } from 'antd';
import kaGE from 'antd/locale/ka_GE';
import { store } from './store/store';
import RestaurantMenu from './components/RestaurantMenu';
import { BrowserRouter, Routes, Route } from "react-router"; // დავამატეთ Routes და Route
import MenuList from './components/MenuList';
import AddCategoryForm from './components/AddCategoryForm';
import AddDishForm from './components/AddDishForm';
import './App.css';

const App: React.FC = () => {
  return (
    // <BrowserRouter>
    // <Provider store={store}>
    //   <ConfigProvider locale={kaGE}>
    //     {/* <MenuList /> */}
    //     <RestaurantMenu />
    //   </ConfigProvider>
    // </Provider>
    // </BrowserRouter>
     <BrowserRouter>
      <Provider store={store}>
        <ConfigProvider locale={kaGE}>
          
          {/* აქ იწყება როუტინგი */}
          <Routes>
            {/* მთავარი გვერდი */}
            <Route path="/" element={<RestaurantMenu />} />

            {/* მენიუს გვერდი */}
            <Route path="/menu" element={<MenuList />} />

            {/* კატეგორიის დამატება */}
            <Route path="/add-category" element={<AddCategoryForm />} />

            {/* კერძის დამატება */}
            <Route path="/add-dish" element={<AddDishForm />} />


            {/* დინამიური როუტი - მაგალითად კონკრეტული კერძისთვის */}
            {/* <Route path="/menu/:id" element={<DishDetail />} /> */}

            {/* ნებისმიერი სხვა მისამართი, რომელიც არ არსებობს */}
            {/* <Route path="*" element={<NotFound />} /> */}
          </Routes>
          
        </ConfigProvider>
      </Provider>
    </BrowserRouter>
  );
};

export default App;
