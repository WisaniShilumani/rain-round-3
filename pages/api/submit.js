// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default async (req, res) => {
  const { values } = req.body;
  console.log(values);
  try {
    // throw new Error("errors");
    res.status(200).json({ status: "OK", statusCode: 200 });
  } catch (e) {
    const errorResponse = {
      errors: {
        firstName: "First name is invalid. Cannot contain numeric values",
        emailAddress: "Email address is quite invalid.",
      },
    };

    res.status(200).json(errorResponse);
  }
};
