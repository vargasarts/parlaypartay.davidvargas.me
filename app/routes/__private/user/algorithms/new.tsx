import { Form } from "@remix-run/react";
import { ActionFunction, redirect } from "@remix-run/node";
import createAlgorithm from "~/data/createAlgorithm.server";
import Button from "@dvargas92495/app/components/Button";
import TextInput from "@dvargas92495/app/components/TextInput";
import remixAppAction from "@dvargas92495/app/backend/remixAppAction.server";
export { default as CatchBoundary } from "@dvargas92495/app/components/DefaultCatchBoundary";
export { default as ErrorBoundary } from "@dvargas92495/app/components/DefaultErrorBoundary";
// import CodeInput from "@dvargas92495/app/components/CodeInput";
import Textarea from "@dvargas92495/app/components/Textarea";

const NewAlgorithmPage = () => {
  return (
    <Form className="flex-grow flex flex-col" method="post">
      <div className="flex-grow overflow-y-auto">
        <TextInput label="Label" name="label" />
        {/* <CodeInput
          language="js"
          name={"logic"}
          label={"Logic"}
          defaultValue={`return Math.random() < 0.5`}
        /> */}
        <Textarea
          name={"logic"}
          label={"Logic"}
          defaultValue={`return Math.random() < 0.5`}
          className={"font-mono"}
        />
      </div>
      <Button>Create</Button>
    </Form>
  );
};

export const action: ActionFunction = (args) => {
  return remixAppAction(args, ({ userId, data, context: { requestId } }) =>
    createAlgorithm({ userId, data, requestId }).then((uuid) =>
      redirect(`/user/algorithms/${uuid}`)
    )
  );
};

// export const links = () => [CodeInput.link];

export default NewAlgorithmPage;
