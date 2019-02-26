export interface PaystackResponseContract{
    data: { 
        reference: string
    }
    [key: string]: any
}

export interface PaystackRequestContract{
    id: string
    classes: string
    type: string | 'inline' | 'embed'
    container: string
    key: string // Your pubic Key from Paystack. Use test key for test mode and live key for live mode
    ref: string // Unique case sensitive transaction reference. Only -,., = and alphanumeric characters allowed.
    email: string // The customer's email address.
    amount: number // (ignored if a plan is provided) Amount in kobo. Ignored if creating a subscription.
    onSuccess: Function
    onClose: Function
    currency?: string // Currency charge should be performed in. Default is NGN
    plan?: string //* (amount not required if present)    If transaction is to create a subscription to a predefined plan, provide plan code here.
    quantity?: number // Used to apply a multiple to the amount returned by the plan code above.
    'data-custom-button'?: string
    channels?: string | string[]
    subaccount?: string // ( string ) The code for the subaccount that owns the payment. e.g. ACCT_8f4s1eq7ml6rlzj
    'transaction_charge'?: number // ( integer, optional ) A flat fee to charge the subaccount for this transaction, in kobo. This overrides the split percentage set when the subaccount was created. Ideally, you will need to use this if you are splitting in flat rates (since subaccount creation only allows for percentage split). e.g. 7000 for a 70 naira flat fee.
    bearer?: string // ( string, optional ) Who bears Paystack charges? account or subaccount. Defaults to account.
    class?: string
    metadata: {
        custom_fields: [
           {
               display_name: "Mobile Number",
               variable_name: "mobile_number",
               value: "+2348012345678"
           }
        ]
      },
    [key: string]: any
}
