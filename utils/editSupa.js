const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://qvlsyciblfnnwcgucega.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * Updates a user's wallet address
 * @param {string} email - User's email
 * @param {string} walletAddress - New wallet address
 */
async function updateWalletAddress(email, walletAddress) {
  const { data, error } = await supabase
    .from('users')
    .update({ wallet: walletAddress })
    .eq('email', email)
    .select()

  if (error) {
    console.error('❌ Error updating wallet address:', error)
    return { success: false, error }
  } else {
    console.log('✅ Wallet address updated:', data)
    return { success: true, data }
  }
}

/**
 * Withdraws funds from a user's account
 * @param {string} auth0Id - User's Auth0 ID
 * @param {number} amount - Amount to withdraw
 */
async function withdrawFunds(auth0Id, amount) {
  try {
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('id, amount')
      .eq('auth0_id', auth0Id)
      .single()
    
    if (fetchError || !userData) {
      console.error('❌ Error fetching user:', fetchError)
      return { success: false, error: fetchError || 'User not found' }
    }
    
    const currentBalance = userData.amount || 0
    const newBalance = Math.max(0, currentBalance - amount) // Ensure balance doesn't go below 0
    
    const { data, error: updateError } = await supabase
      .from('users')
      .update({ amount: newBalance })
      .eq('auth0_id', auth0Id)
      .select()
    
    if (updateError) {
      console.error('Error updating balance:', updateError)
      return { success: false, error: updateError }
    }
    
    console.log(`Withdrawal successful: $${amount} withdrawn. New balance: $${newBalance}`)
    return { 
      success: true, 
      data: { 
        previousBalance: currentBalance,
        withdrawnAmount: amount,
        newBalance: newBalance 
      } 
    }
  } catch (error) {
    console.error('Unexpected error during withdrawal:', error)
    return { success: false, error }
  }
}

module.exports = {
  updateWalletAddress,
  withdrawFunds
}
