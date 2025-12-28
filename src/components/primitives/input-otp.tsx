// @ts-nocheck
"use client"; import * as React from "react";
import { OTPInput, OTPInputContext } from "input-otp";
import { MinusIcon } from "lucide-react"; function InputOTP({ , ...props
}: React.ComponentProps<typeof OTPInput> & { ?: string;
}) { return ( <OTPInput data-slot="input-otp" {...props} /> );
} function InputOTPGroup({ , ...props }: React.ComponentProps<"div">) { return ( <div data-slot= {...props} /> );
} function InputOTPSlot({ index, ...props
}: React.ComponentProps<"div"> & { index: number;
}) { const inputOTPContext = React.useContext(OTPInputContext); const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {}; return ( <div data-slot= data-active={isActive} {...props} > {char} {hasFakeCaret && ( <div style={{ display: undefined, alignItems: "center", justifyContent: "center" }> <div /> </div> )} </div> );
} function InputOTPSeparator({ ...props }: React.ComponentProps<"div">) { return ( <div data-slot= role="separator" {...props}> <MinusIcon /> </div> );
} export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
