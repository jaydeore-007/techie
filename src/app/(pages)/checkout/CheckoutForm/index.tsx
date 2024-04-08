import React, { useCallback, useState } from 'react';
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useRouter } from 'next/navigation';
import { Button } from '../../../_components/Button';
import { Message } from '../../../_components/Message';
import classes from './index.module.scss';

export const CheckoutForm: React.FC<{ description: string }> = ({ description }) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = useCallback(
    async e => {
      e.preventDefault();
      setIsLoading(true);

      try {
        const { error: stripeError, paymentIntent } = await stripe?.confirmPayment({
          elements: elements!,
          redirect: 'if_required',
          confirmParams: {
            return_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/order-confirmation`,
          },
        });

        if (stripeError) {
          setError(stripeError.message);
          setIsLoading(false);
        }

        if (paymentIntent) {
          // Your existing logic for creating the order
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Something went wrong.';
        setError(`Error while submitting payment: ${msg}`);
        setIsLoading(false);
      }
    },
    [stripe, elements, router],
  );

  return (
    <form onSubmit={handleSubmit} className={classes.form}>
      {error && <Message error={error} />}
      <div>{description}</div> {/* Display description */}
      <PaymentElement />
      <div className={classes.actions}>
        <Button label="Back to cart" href="/cart" appearance="secondary" />
        <Button
          label={isLoading ? 'Loading...' : 'Checkout'}
          type="submit"
          appearance="primary"
          disabled={!stripe || isLoading}
        />
      </div>
    </form>
  );
};
