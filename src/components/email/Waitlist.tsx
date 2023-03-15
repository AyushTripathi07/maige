import React from "react";
import { Tailwind } from "@react-email/tailwind";
import { Button } from "@react-email/button";

type Props = {
  link?: string;
};

function WaitlistTemplate({ link }: Props) {
  return (
    <div>
      <Tailwind>
        <h1>Thanks for signing up for Maige!</h1>
        <p className="italic">
          We&apos;re onboarding teams gradually to improve the core prompt as we
          go.
        </p>
        <p>To get access sooner, connect your payment details:</p>
        {link && (
          <Button
            className="w-full rounded-md bg-green-600 p-2 px-4 font-medium text-white"
            href={link}
          >
            Skip the line
          </Button>
        )}
        <p>Best,</p>
        <p>Ted</p>
      </Tailwind>
    </div>
  );
}

export default WaitlistTemplate;
