import { ValidationError } from "../types.ts";

type ErrorProps = {
  error: ValidationError
}

const errorTexts: Record<ValidationError, string> = {
  [ValidationError.noConvenge]: "Integral does not exist as it does not converge",
  [ValidationError.invalidPoints]: "Points are not valid. Check that entered data safisfy data format",
}


export const Error = ({ error }: ErrorProps) => {
  return (
    <p className="text-red-500 font-bold text-lg">{errorTexts[error]}</p>
  )
}