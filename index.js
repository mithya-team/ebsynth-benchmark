const stripe = require('stripe')('sk_test_51JB2b5Ln4kkfaSI5TqS7AjXcVRApAVsj6MajdIwhc7FC6gOLtvimTU4Klz19AY6BOgt3g0BdPR1qvKzO1jL4KP57001pBbLBH2');



const main = async () => {
    const token = await stripe.tokens.create({
        card: {
            "number": "4242424242424242",
            "exp_month": "11",
            "exp_year": "2024",
            "cvc": "344"
        }
    });

    console.log(token);
    const charge = await stripe.charges.create({
        amount: 12000,
        currency: "usd",
        description: "Payment of seconds",
        source: token.id,
        metadata: {
          order_id: "my_order_id"
        }
    });
    console.log(charge);

}

main();