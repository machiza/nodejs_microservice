const { CustomerModel, ProductModel, OrderModel, CartModel } = require('../models');
const { v4: uuidv4 } = require('uuid');
const { APIError, BadRequestError } = require('../../utils/app-errors')


//Dealing with data base operations
class ShoppingRepository {

  // payment

  async Orders(customerId) {
    try{
      const orders = await OrderModel.find({ customerId });      
      return orders;
    }catch(err){
      throw APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Find Orders')
    }
  }

  async Cart(customerId) {

    try {
      
      const cartItems = await CartModel.find({
        customerId
      });
  
      if (cartItems) {
        return cartItems;
      }

    } catch (error) {
      throw error;
    }
    
  }

  async AddCartItem(customerId, item, qty, isRemove) {

    try {

      const cart = await CartModel.findOne({ customerId });

      const { _id } = item;

      if (cart) { 

        let isExist = false;
        
        let cartItems = cart.items;
          
        if (cartItems.length > 0) {
          
          cartItems.map(item => {

            if (item.product._id.toString() === _id.toString()) {
              if (isRemove) {
                cartItems.splice(cartItems.indexOf(item), 1);
              } else {
                item.unit = qty;
              }
              isExist = true;
            }
          });

        } 

        if (!isExist && !isRemove) {
          cartItems.push({ product: {...item}, unit: qty});
        }

        cart.items = cartItems;

        return await cart.save();

      } else {
        return await CartModel.create({
          customerId,
          items: [{ product: {...item}, unit: qty }]
        })
      }

    } catch(err) {
      throw APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Create Customer')
    }

  }
 
 
  async CreateNewOrder(customerId, txnId){

    //check transaction for payment Status
    
    try{
        const cart = await CartModel.findOne({customerId: customerId});

        if(cart){
            
            // let amount = 0;   

            let cartItems = cart.items;

            console.log("cartItems: ", cartItems)

            if(cartItems.length > 0){
                //process Order
                const amount = cartItems.reduce((accumulator, item) => {
                  accumulator + (parseInt(item.product.price) *  parseInt(item.unit));   
                }, 0);
    
                // 86873645
                const orderId = uuidv4();
    
                const order = new OrderModel({
                    orderId,
                    customerId,
                    amount,
                    txnId,
                    status: 'received',
                    items: cartItems
                })
    
                
                const orderResult = await order.save();
                
                cart.items = [];
                await cart.save();

                return orderResult;
            }
        } 

      return {}

    }catch(err){
        console.log(err)

        throw APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Find Category')
    }
    

}
}

module.exports = ShoppingRepository;