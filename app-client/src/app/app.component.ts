import { Component } from '@angular/core';
import { ProductsService } from './products.service';
import { Observer, Observable } from 'rxjs';
import { Product } from './models/Product.model';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { DialogEditProductComponent } from './dialog-edit-product/dialog-edit-product.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  simpleReqProductsObs$: Observable<Product[]>;
  productsErrorHandling: Product[];
  bLoading: boolean = false;
  color: string = "";
  productsId: Product[];
  newlyProducts: Product[] = [];
  productsList: Product[] = [];

  constructor(
    private productsService: ProductsService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
    ) { }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    //this.productsService.getProducts().subscribe(prods => console.log(prods))
  }

  getSimpleHttpRequest() {
    this.simpleReqProductsObs$ = this.productsService.getProducts();
  }

  getProductsWithErrorHandling() {
    this.productsErrorHandling = null;
    this.color = "accent";
    this.bLoading = true;


    this.productsService.getProductsError()
      .subscribe(
        (prods) => {
          this.productsErrorHandling = prods;
          this.bLoading = false;

        },
        (err) => {
          console.log(err);
          console.log("Message: " + err.error.msg);
          console.log("Status: " + err.status);
          let config = new MatSnackBarConfig();
          config.duration = 2000;
          config.panelClass = ['snack-error'];

          if (err.status == 0)
            this.snackBar.open("Could not connect to the server ", '', config);
          else
            this.snackBar.open(err.error.msg, '', config);

          this.bLoading = false;

        },

      )
  }

  getProductsWithErrorHandlingOk() {
    this.productsErrorHandling = null;
    this.color = "primary";
    this.bLoading = true;
    this.productsService.getProductsDelay()
      .subscribe(
        (prods) => {
          this.productsErrorHandling = prods;
          let config = new MatSnackBarConfig();
          config.duration = 2000;
          config.panelClass = ['snack-ok'];
          this.snackBar.open("Products succesfully loaded! ", '', config);
          this.bLoading = false;
        },
        (err) => {
          console.log(err);
          this.bLoading = false;
        }
      )
  }

  getProductsIds() {
    this.productsService.getProductsIds()
      .subscribe((ids) => {
        this.productsId = ids.map(id => ({
          _id: id, name: '', department: '', price: 0
        }));
      });
  }

  loadName(id: string) {
    this.productsService.getProductById(id)
      .subscribe((prod => {
        let index = this.productsId.findIndex(p => p._id === id);
        if (index >= 0)
          this.productsId[index].name = prod.name;

      }
      ));
  }

  saveProduct(name: string, department: string, price: number) {
    let p = { name, department, price };
    this.productsService.saveProduct(p)
      .subscribe(
        (p: Product) => {
          console.log(p);
          this.newlyProducts.push(p);
        },
        (err) => {
          console.log(err);
          let config = new MatSnackBarConfig();
          config.duration = 2000;
          config.panelClass = ['snack-ok'];
          this.snackBar.open("Products succesfully loaded! ", '', config);
          if (err.status == 0)
            this.snackBar.open("Could not connect to the server ", '', config);
          else
            this.snackBar.open(err.error.msg, '', config);
        }

      );
  }

  loadProductsList() {
    this.productsService.getProducts()
      .subscribe(prods => {
        this.productsList = prods;
      });

  }

  deleteProduct(prod: Product) {
    console.log(prod);
    this.productsService.deleteProduct(prod)
      .subscribe(
        (res) => {
          let i = this.productsList.findIndex(p => p._id === prod._id);
          if(i >= 0)
            this.productsList.splice(i, 1);
        },
        (err) => {
          console.log(err);
        }
      )
  }

  editProduct(prod: Product) {
    let newProduct: Product = {...prod};
    let dialogRef = this.dialog.open(DialogEditProductComponent, {width: '400px', data: newProduct});
    dialogRef.afterClosed()
      .subscribe( p => {
        if (p){
          this.productsService.editProduct(p)
            .subscribe(
              (resp) => {
                let i = this.productsList.findIndex(p => p._id === resp._id);
                if(i>=0)
                  this.productsList[i] = resp;
              },
              (err) => console.error(err)
            )
        }
      })
  }
}
