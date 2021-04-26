// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import zxcvbn from "zxcvbn";

export default (req, res) => {
  const { password, related_terms } = req.body;

  const { score } = zxcvbn(password, related_terms);
  res.status(200).json({ score });
};
