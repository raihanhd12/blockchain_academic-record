import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
} from "@material-tailwind/react";
const InfoPoin = () => {
  return (
    <Card className="h-full w-full bg-white shadow-lg rounded-lg">
      <CardHeader className="rounded-3 bg-dark-sidebar mb-4 border-purple-400 border-4">
        <Typography
          variant="h4"
          color="white"
          className="font-bold text-center p-2"
        >
          Info Poin
        </Typography>
        <Typography color="white" className="mt-1 text-sm text-center p-2">
          This is Info Poin
        </Typography>
      </CardHeader>
      <CardBody className="overflow-auto px-4 py-6 bg-white max-h-[630px]">
        Info Poin
      </CardBody>
    </Card>
  );
};

export default InfoPoin;
