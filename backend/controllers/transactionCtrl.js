const expressAsyncHandler = require("express-async-handler");
const Category = require("../model/Category");
const Transaction = require("../model/Transaction");

const transactionController = {
  //add
    create : expressAsyncHandler(async(req, res) =>{
      const {type, category, amount, date, description} = req.body;
      if (!type || !date || !amount){
        throw new Error("Type, Amount and Date are required");
      }
      // create
      const transaction = await Transaction.create({
        user: req.user,
        amount,
        date,
        type,
        category,
        description,
      });
      res.status(201).json(transaction);
    }),
  //List
  
  getFilterTransaction : expressAsyncHandler(async(req, res) =>{
    const { startDate, endDate, type, category} = req.query;
    let filters = { user: req.user};

    if(startDate) {

    filters.date = {...filters.date, $gte: new Date(startDate)};}

    if(endDate){
      filters.date = {...filters.date, $lte: new Date(endDate)}
    };

    if (type){
      filters.type = type;
    };

    if (category) {
      if (category !== "All") {
          if (category === "Uncategorized") {
              filters.category = "Uncategorized";
          } else {
              filters.category = category;
          }
      }
  }

    const transactions = await Transaction.find(filters).sort({date: -1})
    res.json(transactions);
  }),

//update
  update : expressAsyncHandler(async (req, res) => {
  const transactionUpdate = await Transaction.findById(req.params.id);
  if (transactionUpdate && transactionUpdate.user.toString() === req.user.toString()) {
      // Update fields with req.body values or retain current values
      ['type', 'category', 'amount', 'date', 'description'].forEach(field => {
          transactionUpdate[field] = req.body[field] || transactionUpdate[field];
      });                         

      // Save updated transaction and respond with it
      res.json(await transactionUpdate.save());
  }
}),

  //delete
  delete : expressAsyncHandler(async (req, res) => {
    const transactionUpdate = await Transaction.findById(req.params.id);
        // Ensure req.body.id exists before calling toString()
        if ( transactionUpdate && transactionUpdate.user.toString() === req.user.toString()) {
            await Transaction.findByIdAndDelete(req.params.id);
            return res.json({ message: "Transaction is removed" });
    }
})
};


module.exports = transactionController;
