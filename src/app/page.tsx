"use client";

import { Header } from "@/components/common/header";
import InfoCardsRow from "@/components/infoCardsRow";
import TablesAndControllers from "@/components/mainPage/tablesAndControlers";
import ProtectedClient from "@/components/ProtectedClient";

const Home = () => {

  return (
    <ProtectedClient>

      <Header/>
      <InfoCardsRow/>
      <TablesAndControllers/>

    </ProtectedClient>
  );
}

export default Home;