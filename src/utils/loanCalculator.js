// Loan and EMI calculation utilities

export const loanCalculator = {
  /**
   * Calculate EMI using the formula:
   * EMI = [P x R x (1+R)^N] / [(1+R)^N-1]
   * P = Principal loan amount
   * R = Monthly interest rate (annual rate / 12 / 100)
   * N = Loan tenure in months
   */
  calculateEMI(principal, annualRate, tenureMonths) {
    const monthlyRate = annualRate / 12 / 100;
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / 
                (Math.pow(1 + monthlyRate, tenureMonths) - 1);
    return Math.round(emi * 100) / 100;
  },

  /**
   * Generate complete amortization schedule
   */
  generateAmortizationSchedule(principal, annualRate, tenureMonths, startDate) {
    const emi = this.calculateEMI(principal, annualRate, tenureMonths);
    const monthlyRate = annualRate / 12 / 100;
    let balance = principal;
    const schedule = [];

    const start = new Date(startDate);

    for (let month = 1; month <= tenureMonths; month++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = emi - interestPayment;
      balance = balance - principalPayment;

      const dueDate = new Date(start);
      dueDate.setMonth(dueDate.getMonth() + month - 1);

      schedule.push({
        month,
        dueDate: dueDate.toISOString().split('T')[0],
        emi: Math.round(emi * 100) / 100,
        principal: Math.round(principalPayment * 100) / 100,
        interest: Math.round(interestPayment * 100) / 100,
        balance: Math.max(0, Math.round(balance * 100) / 100),
        paid: false
      });
    }

    return schedule;
  },

  /**
   * Calculate total interest payable
   */
  calculateTotalInterest(principal, annualRate, tenureMonths) {
    const emi = this.calculateEMI(principal, annualRate, tenureMonths);
    const totalPayment = emi * tenureMonths;
    return Math.round((totalPayment - principal) * 100) / 100;
  },

  /**
   * Calculate remaining balance based on payments made
   */
  calculateRemainingBalance(schedule, paidMonths) {
    if (paidMonths >= schedule.length) return 0;
    return schedule[paidMonths]?.balance || 0;
  },

  /**
   * Calculate total interest paid so far
   */
  calculateInterestPaid(schedule, paidMonths) {
    return schedule
      .slice(0, paidMonths)
      .reduce((sum, payment) => sum + payment.interest, 0);
  },

  /**
   * Calculate total principal paid so far
   */
  calculatePrincipalPaid(schedule, paidMonths) {
    return schedule
      .slice(0, paidMonths)
      .reduce((sum, payment) => sum + payment.principal, 0);
  },

  /**
   * Get loan summary
   */
  getLoanSummary(loan) {
    const schedule = loan.schedule || [];
    const paidCount = schedule.filter(s => s.paid).length;
    const totalMonths = schedule.length;
    const remainingMonths = totalMonths - paidCount;
    
    const totalInterest = this.calculateTotalInterest(
      loan.principal,
      loan.interestRate,
      loan.tenureMonths
    );
    
    const interestPaid = this.calculateInterestPaid(schedule, paidCount);
    const principalPaid = this.calculatePrincipalPaid(schedule, paidCount);
    const remainingBalance = loan.principal - principalPaid;
    
    const progress = (paidCount / totalMonths) * 100;

    return {
      emi: loan.emi,
      totalMonths,
      paidCount,
      remainingMonths,
      totalInterest,
      interestPaid,
      principalPaid,
      remainingBalance,
      progress,
      nextDueDate: schedule.find(s => !s.paid)?.dueDate || null
    };
  },

  /**
   * Calculate prepayment impact
   */
  calculatePrepaymentImpact(principal, annualRate, tenureMonths, prepaymentAmount, currentMonth) {
    // Calculate remaining balance
    const schedule = this.generateAmortizationSchedule(principal, annualRate, tenureMonths, new Date());
    const remainingBalance = schedule[currentMonth - 1]?.balance || principal;
    
    // New balance after prepayment
    const newBalance = remainingBalance - prepaymentAmount;
    const remainingMonths = tenureMonths - currentMonth;
    
    // Recalculate EMI with new balance
    const newEMI = this.calculateEMI(newBalance, annualRate, remainingMonths);
    const oldEMI = this.calculateEMI(principal, annualRate, tenureMonths);
    
    // Calculate savings
    const oldTotalPayment = oldEMI * remainingMonths;
    const newTotalPayment = newEMI * remainingMonths;
    const interestSaved = oldTotalPayment - newTotalPayment - prepaymentAmount;
    
    return {
      newEMI: Math.round(newEMI * 100) / 100,
      oldEMI: Math.round(oldEMI * 100) / 100,
      interestSaved: Math.round(interestSaved * 100) / 100,
      newBalance: Math.round(newBalance * 100) / 100
    };
  }
};
