# Calculate IRR (Internal Rate of Return)

Internal Rate of Return is a method of calculating an investment’s rate of return. Given a collection of pairs (time, cash flow) and the Present Value (PV), a discount rate can be obtained using the Net Present Value (NPV) formula. This is similar to Compound Annual Growth Rate (CAGR) however CAGR only uses an Initial Value and Final Value to determine the rate.

### Formulas for Regular Intervals

#### NPV = 0 = SUM( C<sub>n</sub>/(1+r)<sup>n</sup> )

#### CAGR = (V<sub>f</sub>/V<sub>i</sub>)<sup>1/n</sup> - 1

### Formula for Irregular Intervals

#### NPV = 0 = C<sub>0</sub> + SUM( C<sub>n</sub>/(1+r)<sup>t<sub>n</sub></sup> )

To calculate IRR for a set of irregular investments we must use a recursive approximation method (Newtons Method) with a recursive limit and approximation precission. If the recursive limit is hit before the approximation precission then we have no solution.

### Newton's Method

#### x<sub>n+1</sub> = x<sub>n</sub> - f(x<sub>n</sub>)/f'(x<sub>n</sub>)

Converting these functions for our specific purposes gives:

#### NPV = PV - SUM( C<sub>n</sub>(1+r)<sup>t<sub>n</sub></sup> )

#### NPV' = -SUM( C<sub>n</sub>t<sub>n</sub>(1+r)<sup>t<sub>n</sub>-1</sup> )

#### r<sub>n+1</sub> = r<sub>n</sub> - NPV<sub>r<sub>n</sub></sub>/NPV'<sub>r<sub>n</sub></sub>

#### r<sub>0</sub> = 1/PV \* SUM( C<sub>n</sub>-1 )

## How To Use

In the toolkit select a flag color that will represent transaction contributions/cashflow into investments. In the investment account (off-budget only) flag any transactions that are contribution money into the account. Transactions that are not flagged with be assumed as gain/loss. Calculate IRR will calculate the rate of return for flagged contributions using gain/loss from unflagged transactions.

If a date range filter is applied for 1 calendar year or less (ie 2021-03 to 2021-06) then the Internal Rate of Return will be calculated for both the entire timeframe and the year of the date range filter. Otherwise the IRR is only calculated for the accounts entire timeframe (first transaction to last transaction).
