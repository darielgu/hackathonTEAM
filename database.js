import {
  DynamoDBClient,
  DescribeTableCommand,
  CreateTableCommand,
  PutItemCommand,
  GetItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
} from "@aws-sdk/client-dynamodb";

const REGION = "us-west-2";
const TABLE_NAME = "Transactions";

const ddbClient = new DynamoDBClient({ region: REGION });

async function checkOrCreateTable() {
  try {
    const tableDetails = await ddbClient.send(
      new DescribeTableCommand({ TableName: TABLE_NAME })
    );
    console.log("Table already exists:", tableDetails.Table.TableName);
  } catch (err) {
    if (err.name === "ResourceNotFoundException") {
      console.log("Table not found. Creating table...");
      const createTableParams = {
        TableName: TABLE_NAME,
        KeySchema: [{ AttributeName: "id", KeyType: "HASH" }], // Partition key
        AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }], // 'S' for String
        ProvisionedThroughput: {
          ReadCapacityUnits: 1,
          WriteCapacityUnits: 1,
        },
      };
      await ddbClient.send(new CreateTableCommand(createTableParams));
      console.log("Table created successfully.");
    } else {
      console.error("Error checking or creating table:", err);
      throw err;
    }
  }
}

async function createItem(item) {
  const createItemParams = {
    TableName: TABLE_NAME,
    Item: Object.entries(item).reduce((acc, [key, value]) => {
      acc[key] =
        typeof value === "number" ? { N: value.toString() } : { S: value };
      return acc;
    }, {}),
  };
  await ddbClient.send(new PutItemCommand(createItemParams));
  console.log("Item inserted:", item);
}

async function getItem(id) {
  const getItemParams = {
    TableName: TABLE_NAME,
    Key: { id: { S: id } },
  };
  const { Item } = await ddbClient.send(new GetItemCommand(getItemParams));
  console.log("Retrieved Item:", Item);
}

async function updateItem(id, updatedAttributes) {
  const updateExpressions = [];
  const expressionAttributeNames = {};
  const expressionAttributeValues = {};

  for (const [key, value] of Object.entries(updatedAttributes)) {
    updateExpressions.push(`#${key} = :${key}`);
    expressionAttributeNames[`#${key}`] = key;
    expressionAttributeValues[`:${key}`] =
      typeof value === "number" ? { N: value.toString() } : { S: value };
  }

  const updateItemParams = {
    TableName: TABLE_NAME,
    Key: { id: { S: id } },
    UpdateExpression: `SET ${updateExpressions.join(", ")}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
  };

  await ddbClient.send(new UpdateItemCommand(updateItemParams));
  console.log("Updated item:", id);
}

async function deleteItem(id) {
  const deleteItemParams = {
    TableName: TABLE_NAME,
    Key: { id: { S: id } },
  };
  await ddbClient.send(new DeleteItemCommand(deleteItemParams));
  console.log("Deleted item:", id);
}

// TESTING TRANSACTION TABLE

// async function main() {
//   await checkOrCreateTable();

//   // Example usage
//   await createItem({
//     id: "1",
//     description: "This is a test transaction",
//     amount: 200.5,
//     category: "Food",
//     date: "2025-01-25",
//   });

//   await getItem("1");

//   await updateItem("1", {
//     description: "Updated transaction",
//     amount: 250.0,
//     category: "Groceries",
//   });

//   //await deleteItem("1");
// }

// main().catch(console.error);

// DEFINING MANAGERS TABLE

async function createManagersTable() {
  try {
    const tableDetails = await ddbClient.send(
      new DescribeTableCommand({ TableName: "Managers" })
    );
    console.log("Table already exists:", tableDetails.Table.TableName);
  } catch (err) {
    if (err.name === "ResourceNotFoundException") {
      console.log("Table not found. Creating table...");
      const createTableParams = {
        TableName: "Managers",
        KeySchema: [
          { AttributeName: "username", KeyType: "HASH" }, // Partition key
        ],
        AttributeDefinitions: [
          { AttributeName: "username", AttributeType: "S" },
        ],
        ProvisionedThroughput: {
          ReadCapacityUnits: 1,
          WriteCapacityUnits: 1,
        },
      };
      await ddbClient.send(new CreateTableCommand(createTableParams));
      console.log("Managers table created successfully.");
    } else {
      console.error("Error checking or creating table:", err);
      throw err;
    }
  }
}

async function createManager(manager) {
  const createManagerParams = {
    TableName: "Managers",
    Item: {
      username: { S: manager.username },
      password_hash: { S: manager.password_hash },
      role: { S: manager.role || "manager" }, // Default role is "manager"
    },
  };
  await ddbClient.send(new PutItemCommand(createManagerParams));
  console.log("Manager created:", manager.username);
}

async function authenticateManager(username, password) {
  const getParams = {
    TableName: "Managers",
    Key: { username: { S: username } },
  };
  const { Item } = await ddbClient.send(new GetItemCommand(getParams));

  if (Item) {
    const storedPasswordHash = Item.password_hash.S;

    // Use comparePassword to check if the entered password matches the stored hash
    const isPasswordValid = await comparePassword(password, storedPasswordHash);

    if (isPasswordValid) {
      console.log("Login successful!");
      return true;
    } else {
      console.log("Invalid credentials!");
      return false;
    }
  } else {
    console.log("Manager not found!");
    return false;
  }
}

import bcrypt from "bcrypt";

async function hashPassword(password) {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}

async function comparePassword(plainPassword, hashedPassword) {
  const match = await bcrypt.compare(plainPassword, hashedPassword);
  return match;
}

// TESTING MANAGERS TABLE

// async function main() {
//   await createManagersTable(); // Ensure the table exists

//   // Creating a new manager
//   const manager = {
//     username: "manager1",
//     password_hash: await hashPassword("managerpassword123"), // Hash the password
//     role: "manager", // Default role
//   };
//   await createManager(manager);

//   // Authenticating a manager
//   const isAuthenticated = await authenticateManager(
//     "manager1",
//     "managerpassword123"
//   );
//   console.log(isAuthenticated ? "Manager logged in!" : "Login failed.");
// }

// main().catch(console.error);
