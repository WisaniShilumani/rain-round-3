import {
  Formik,
  Form,
  Field,
  useFormik,
  useFormikContext,
  ErrorMessage,
} from "formik";
import styled from "@emotion/styled";
import debounce from "lodash/debounce";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { first } from "lodash";

const FIELD_NAME_FIRST_NAME = "firstName";
const FIELD_NAME_MIDDLE_NAME = "middleName";
const FIELD_NAME_LAST_NAME = "lastName";
const FIELD_NAME_EMAIL = "emailAddress";
const FIELD_NAME_PASSWORD = "password";
const FIELD_NAME_HONEYPOT = "extraField";

const FormWrapper = styled.div`
  background-color: rgb(36, 41, 46);
  height: 100vh;
  width: 100%;

  form {
    max-width: 600px;
    margin: 0 auto;
  }
`;
const Flex2Col = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  > * {
    width: calc(50% - 8px);
  }
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  margin: 1rem 0;
  position: relative;

  input {
    padding: 16px 8px;
    font-size: 18px;
    border: 0;
    outline: 0;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
    background-color: #2d3439;
    color: white;
  }

  span {
    color: red;
  }

  p {
    color: #ddd;
  }
`;

const HoneyPotField = styled(FormField)`
  height: 1px;
  left: -100vw;
  position: absolute;
`;

const StrengthBar = styled.div`
  position: absolute;
  left: 0;
  width: ${({ passwordStrength }) => `${passwordStrength}%`};
  height: 2px;
  background-color: green;
  z-index: 2;
  top: 53px;
`;

const initialValues = {
  [FIELD_NAME_FIRST_NAME]: "",
  [FIELD_NAME_MIDDLE_NAME]: "",
  [FIELD_NAME_LAST_NAME]: "",
  [FIELD_NAME_EMAIL]: "",
  [FIELD_NAME_PASSWORD]: "",
  [FIELD_NAME_HONEYPOT]: "",
};

const signUpUser = async (values, formikBag) => {
  const {
    [FIELD_NAME_FIRST_NAME]: firstName,
    [FIELD_NAME_MIDDLE_NAME]: middleName,
    [FIELD_NAME_LAST_NAME]: lastName,
    [FIELD_NAME_EMAIL]: emailAddress,
    [FIELD_NAME_PASSWORD]: password,
  } = values;

  const { setErrors } = formikBag;

  try {
    const result = await axios.post("/api/submit", {
      email: emailAddress,
      first_name: firstName,
      last_name: lastName,
      middle_name: middleName,
      password: password,
    });

    const response = result.data;

    if (response.errors) {
      setErrors(response.errors);
      throw new Error("Could not submit");
    }
    // await axios.post("https://api-staging-0.rain.bh/api/2/signup", {
    //   email: emailAddress,
    //   first_name: firstName,
    //   last_name: lastName,
    //   middle_name: middleName,
    //   password: password,
    // });
  } catch (e) {
    console.log(e.message);
  }
};

const getPasswordStrength = async (password, values) => {
  const {
    [FIELD_NAME_FIRST_NAME]: firstName,
    [FIELD_NAME_MIDDLE_NAME]: middleName,
    [FIELD_NAME_LAST_NAME]: lastName,
    [FIELD_NAME_EMAIL]: emailAddress,
  } = values;

  const relatedTerms = [firstName, middleName, lastName, emailAddress].filter(
    (text) => !!text?.length
  );

  try {
    const { data } = await axios.post("/api/validators", {
      password,
      related_terms: relatedTerms,
    });

    return data;
  } catch (e) {
    throw e;
  }
};

const validate = (values) => {
  const errors = {};

  const reEmail = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

  const {
    [FIELD_NAME_FIRST_NAME]: firstName,
    [FIELD_NAME_LAST_NAME]: lastName,
    [FIELD_NAME_EMAIL]: emailAddress,
    [FIELD_NAME_PASSWORD]: password,
  } = values;

  if (!firstName?.length) {
    errors[FIELD_NAME_FIRST_NAME] = "First name is required";
  }

  if (!lastName?.length) {
    errors[FIELD_NAME_LAST_NAME] = "Last name is required";
  }

  if (!emailAddress?.length) {
    errors[FIELD_NAME_EMAIL] = "Email is required";
  } else if (!reEmail.test(emailAddress)) {
    errors[FIELD_NAME_EMAIL] = "Email is invalid";
  }

  if (!password?.length) {
    errors[FIELD_NAME_PASSWORD] = "Password is required";
  }

  return errors;
};

const STRENGTHS = ["Very weak", "Weak", "Average", "Strong", "Very strong"];
const SignUpForm = () => {
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordStrengthText, setPasswordStrengthText] = useState("");
  const { handleSubmit, values } = useFormikContext();

  const password = values[FIELD_NAME_PASSWORD];

  const handleCheckPassword = (text, newValues) => {
    getPasswordStrength(text, newValues).then((res) => {
      const { score } = res;
      setPasswordStrengthText(STRENGTHS[score]);
      setPasswordStrength((100 * score) / 5);
    });
  };

  const delayedHandleCheckPassword = useCallback(
    debounce(handleCheckPassword, 300),
    []
  );

  useEffect(() => {
    if (!!password?.length) {
      delayedHandleCheckPassword(password, values);
    }
  }, [password]);

  return (
    <FormWrapper>
      <Form onSubmit={handleSubmit}>
        <div>
          <Flex2Col>
            <FormField>
              <Field name={FIELD_NAME_FIRST_NAME} placeholder="First name" />
              <ErrorMessage name={FIELD_NAME_FIRST_NAME} component="span" />
            </FormField>
            <FormField>
              <Field name={FIELD_NAME_MIDDLE_NAME} placeholder="Middle name" />
              <p>Optional</p>
            </FormField>
          </Flex2Col>
          <FormField>
            <Field name={FIELD_NAME_LAST_NAME} placeholder="Last name" />
            <ErrorMessage name={FIELD_NAME_LAST_NAME} component="span" />
          </FormField>
          <FormField>
            <Field name={FIELD_NAME_EMAIL} placeholder="Email" />
            <ErrorMessage name={FIELD_NAME_EMAIL} component="span" />
          </FormField>
          <FormField>
            <Field name={FIELD_NAME_PASSWORD} placeholder="Password" />
            <ErrorMessage name={FIELD_NAME_PASSWORD} component="span" />
            <StrengthBar passwordStrength={passwordStrength} />
            <p>{passwordStrengthText}</p>
          </FormField>
          <HoneyPotField>
            <Field name={FIELD_NAME_HONEYPOT} placeholder="Honeypot" />
          </HoneyPotField>
        </div>
        <div>
          <button type="submit">Submit</button>
        </div>
      </Form>
    </FormWrapper>
  );
};

const SignUpFormContainer = () => {
  return (
    <Formik
      initialValues={initialValues}
      validate={validate}
      onSubmit={signUpUser}
      validateOnBlur={false}
      validateOnChange={false}
    >
      <SignUpForm />
    </Formik>
  );
};

const Home = () => {
  return (
    <div>
      <h1>Create Account</h1>
      <SignUpFormContainer />
    </div>
  );
};

export default Home;
