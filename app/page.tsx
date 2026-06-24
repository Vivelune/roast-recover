import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [
    users,
    products,
    orders,
    subscriptions,
    equipment,
    batches,
  ] = await Promise.all([
    prisma.user.findMany({
      include: {
        company: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.product.findMany({
      include: {
        certification: true,
      },
    }),

    prisma.order.findMany({
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    }),

    prisma.subscription.findMany({
      include: {
        user: true,
        product: true,
      },
    }),

    prisma.equipmentRegistryItem.findMany({
      include: {
        user: true,
        product: true,
      },
    }),

    prisma.productionBatch.findMany({
      include: {
        product: true,
      },
    }),
  ]);


  const money = (cents:number)=>
    new Intl.NumberFormat("en-US",{
      style:"currency",
      currency:"USD"
    }).format(cents/100);


  return (
    <main
      className="min-h-screen p-8"
      style={{
        background:"#0E0B08",
        color:"#F2EDE6",
        fontFamily:"DM Sans"
      }}
    >

      <div className="max-w-7xl mx-auto">


        <header className="mb-10">

          <h1
            className="text-5xl mb-3"
            style={{
              fontFamily:"Inter Tight",
              fontWeight:500
            }}
          >
            Roast & Recover
            <span style={{color:"#B5481F"}}>
              {" "}Dashboard
            </span>
          </h1>

          <p style={{color:"#7A6A58"}}>
            Neon database live overview
          </p>

        </header>



        {/* STATS */}

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-10">

          {[
            ["Users",users.length],
            ["Products",products.length],
            ["Orders",orders.length],
            ["Subscriptions",subscriptions.length],
            ["Equipment",equipment.length],
            ["Batches",batches.length],
          ].map(([name,value])=>(
            <div
              key={name}
              className="rounded-2xl p-5"
              style={{
                background:"#2A2118",
                border:"1px solid #3A3F42"
              }}
            >

              <p
                className="text-sm"
                style={{color:"#7A6A58"}}
              >
                {name}
              </p>

              <p
                className="text-4xl mt-2"
                style={{
                  fontFamily:"Inter Tight"
                }}
              >
                {value}
              </p>

            </div>
          ))}

        </div>




        {/* USERS */}

        <section
          className="rounded-2xl p-6 mb-8"
          style={{
            background:"#17120E",
            border:"1px solid #3A3F42"
          }}
        >

          <h2 className="text-2xl mb-5">
            Customers
          </h2>


          {users.map(user=>(

            <div
              key={user.id}
              className="flex justify-between py-3 border-b"
              style={{
                borderColor:"#3A3F42"
              }}
            >

              <div>
                <p>{user.name}</p>

                <p
                  className="text-sm"
                  style={{color:"#7A6A58"}}
                >
                  {user.email}
                </p>
              </div>


              <span
                style={{
                  color:"#B5481F"
                }}
              >
                {user.role}
              </span>

            </div>

          ))}

        </section>





        {/* PRODUCTS */}

        <section
          className="rounded-2xl p-6 mb-8"
          style={{
            background:"#17120E",
            border:"1px solid #3A3F42"
          }}
        >

        <h2 className="text-2xl mb-5">
          Products
        </h2>


        {products.map(product=>(

          <div
            key={product.id}
            className="flex justify-between py-4"
          >

            <div>

              <p>
                {product.name}
              </p>

              <p
                className="text-sm"
                style={{color:"#7A6A58"}}
              >
                {product.category}
              </p>

            </div>


            <div className="text-right">

              <p>
                {money(product.priceCents)}
              </p>

              {product.certification && (

                <p
                  className="text-xs"
                  style={{
                    color:"#B5481F"
                  }}
                >
                  {product.certification.type}
                </p>

              )}

            </div>


          </div>

        ))}


        </section>






        {/* ORDERS */}

        <section
          className="rounded-2xl p-6 mb-8"
          style={{
            background:"#17120E",
            border:"1px solid #3A3F42"
          }}
        >

        <h2 className="text-2xl mb-5">
          Orders
        </h2>


        {orders.map(order=>(

          <div
            key={order.id}
            className="flex justify-between py-4"
          >

            <div>

              <p>
                {order.user.name}
              </p>

              <p
                className="text-sm"
                style={{color:"#7A6A58"}}
              >
                {order.items.length} item(s)
              </p>

            </div>


            <span
              className="px-3 py-1 rounded-full text-sm"
              style={{
                color:"#B5481F",
                border:"1px solid #B5481F"
              }}
            >
              {order.status}
            </span>


          </div>

        ))}


        </section>






        {/* EQUIPMENT */}

        <section
          className="rounded-2xl p-6 mb-8"
          style={{
            background:"#17120E",
            border:"1px solid #3A3F42"
          }}
        >

        <h2 className="text-2xl mb-5">
          Equipment Registry
        </h2>


        {equipment.map(item=>(

          <div
            key={item.id}
            className="py-4"
          >

            <p>
              {item.product.name}
            </p>


            <p
              className="text-sm"
              style={{color:"#7A6A58"}}
            >
              Owner: {item.user.name}
            </p>


          </div>

        ))}


        </section>





        {/* PRODUCTION */}

        <section
          className="rounded-2xl p-6"
          style={{
            background:"#17120E",
            border:"1px solid #3A3F42"
          }}
        >

        <h2 className="text-2xl mb-5">
          Production
        </h2>


        {batches.map(batch=>(

          <div
            key={batch.id}
            className="flex justify-between py-3"
          >

            <span>
              {batch.product.name}
            </span>


            <span
              style={{
                color:"#B5481F"
              }}
            >
              {batch.status}
            </span>


          </div>

        ))}


        </section>


      </div>

    </main>
  );
}