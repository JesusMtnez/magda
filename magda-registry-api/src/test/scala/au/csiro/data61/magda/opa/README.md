# Technical Note on Access Control Integration Tests

Follow the instructions below to perform the integration tests on your local development box.

### Enable the integration tests

Comment out the @Ignore annotation near the top of file opa/RecordsOpaSpec.scala. Do not commit
the change as the tests are not fully automated yet. The tests will fail if they are run in the
CI tests.

### Deploy combined-db with authorization-db and registry-db

For example, if using namespace test2, run

```
cd <magda project directory>

helm upgrade test2 deploy/helm/magda --namespace test2 --install --recreate-pods -f deploy/helm/local-auth-test.yml --set tags.all=false --set tags.combined-db=true --set tags.authorization-db=true --set tags.registry-db=true

kubectl.exe -n test2 port-forward combined-db-0 5432:5432
```

If on Windows 10, run

```
helm upgrade test2 deploy/helm/magda --namespace test2 --install --recreate-pods -f deploy/helm/local-auth-test.yml -f deploy/helm/docker-desktop-windows.yml --set tags.all=false --set tags.combined-db=true --set tags.authorization-db=true --set tags.registry-db=true
```

You might need to delete your existing volume first

```
kubectl delete pv local-storage-volume
```

then create a new volume for the new database

```
kubectl apply -f deploy/kubernetes/local-storage-volume.yaml
```

### Populate table org_units

Use a postgres client to execute data/organizations.sql in the auth database. The structure of
the organization can be seen in the comment of the sql file.

### Populate table users and assign user roles

Use a postgres client to execute data/users.sql in the auth database. There are 4 authenticated
users in different organization units. See the comment in the sql file for details.

### Start opa server

```
cd deploy/helm/magda/charts/opa

docker-compose up
```

It will use the opa policies that are the same as in the real deployment.

### Start authorization service

```
cd magda-authorization-api

yarn dev
```

### Start the integration tests

It is very convenient to debug the tests with IntelliJ IDEA.

After running the tests in RecordsOpaSpect once, all test data are persisted in the database.
You may run RegistryApp with default config from the IntelliJ then query the registry api as
different users. A user is identified by a jwt token in the request header.

To find out the jwt tokens for all testing users, uncomment the two print statements in method
addJwtToken in file opa/ApiWithOpaSpec.scala.

Here are some jwt token examples:

```
userId: 00000000-0000-1000-0000-000000000000
jwtToken: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiIwMDAwMDAwMC0wMDAwLTEwMDAtMDAwMC0wMDAwMDAwMDAwMDAifQ.2V0FqFp89olSyEHoVe7NNMHBTsA2TZ2_sc8FF90JcqA

userId: 00000000-0000-1000-0001-000000000000
jwtToken: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiIwMDAwMDAwMC0wMDAwLTEwMDAtMDAwMS0wMDAwMDAwMDAwMDAifQ.x26uJGh1HwYAKgINr_zR_OPPpS53gwqbqVh9mCyt57o

userId: 00000000-0000-1000-0002-000000000000
jwtToken: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiIwMDAwMDAwMC0wMDAwLTEwMDAtMDAwMi0wMDAwMDAwMDAwMDAifQ.JoO8QCmesnXzYmdZHSqwwZtaK_CpLUvjKL2I090DoYk

userId: 00000000-0000-1000-0003-000000000000
jwtToken: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiIwMDAwMDAwMC0wMDAwLTEwMDAtMDAwMy0wMDAwMDAwMDAwMDAifQ.cCCS3XqslU6ZQYlYhkJ9Fm4mFj7E_g4dmGnRGEgaZmA
```

Here is an example query on behalf of user with ID of 00000000-0000-1000-0003-000000000000:
(Do not forget to add tenant id header too.)

```
curl --header "X-Magda-Session:eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiIwMDAwMDAwMC0wMDAwLTEwMDAtMDAwMy0wMDAwMDAwMDAwMDAifQ.cCCS3XqslU6ZQYlYhkJ9Fm4mFj7E_g4dmGnRGEgaZmA" --header "X-Magda-Tenant-Id: 0" http://localhost:6101/v0/records?aspect=organization | json_pp
```

And the response might look like:

```
{
   "records" : [
      {
         "name" : "This record can only be viewed by Section C of Branch B of Dep. A or higher.",
         "id" : "record-3",
         "tenantId" : 0,
         "aspects" : {
            "organization" : {
               "email" : "Section.C@somewhere",
               "name" : "Section C, Branch B, Dep. A"
            }
         }
      },
      {
         "aspects" : {
            "organization" : {
               "name" : "Section C, Branch B, Dep. A",
               "email" : "Section.C@somewhere"
            }
         },
         "tenantId" : 0,
         "id" : "record-4",
         "name" : "This record has no access control."
      }
   ],
   "hasMore" : false
}
```

#### Note

If the above jwt token is incorrect (e.g. typo), the user will be considered unauthenticated and only
get "record-4" that has no access restriction.
